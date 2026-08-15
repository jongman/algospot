"""Trusted Docker client for one disposable compile or execution step.

Only the judge controller imports this module.  The public web process must
never receive the Docker socket.
"""

import base64
import json
from pathlib import Path
import re
import uuid

import docker
from docker.errors import APIError, DockerException, ImageNotFound
from requests.exceptions import ReadTimeout


_SAFE_IMAGE = re.compile(r'^[A-Za-z0-9][A-Za-z0-9._/@:-]+$')


class JudgeInfrastructureError(RuntimeError):
    pass


class DisposableContainerExecutor:
    """Run server-selected commands in tightly constrained sibling containers."""

    def __init__(self, runtime, work_root, allow_runc=False,
                 require_digest=True, client=None):
        if runtime != 'runsc' and not (runtime == 'runc' and allow_runc):
            raise JudgeInfrastructureError(
                'Submission execution requires gVisor runtime runsc; '
                'runc is allowed only for the explicit controlled smoke test')
        self.runtime = runtime
        self.work_root = Path(work_root).resolve()
        self.allow_runc = allow_runc
        self.require_digest = require_digest
        self.client = client or docker.from_env(timeout=10)
        self._verify_runtime()

    def _verify_runtime(self):
        try:
            runtimes = self.client.info().get('Runtimes', {})
        except DockerException as exc:
            raise JudgeInfrastructureError(
                'Cannot reach the Docker daemon: %s' % exc) from exc
        if self.runtime not in runtimes:
            raise JudgeInfrastructureError(
                'Docker runtime %s is not installed (available: %s)' % (
                    self.runtime, ', '.join(sorted(runtimes))))

    def _validate_image(self, image):
        if not _SAFE_IMAGE.match(image):
            raise JudgeInfrastructureError('Invalid judge image reference')
        if self.require_digest and '@sha256:' not in image:
            raise JudgeInfrastructureError(
                'Production judge images must be pinned by sha256 digest: %s' %
                image)
        try:
            self.client.images.get(image)
        except ImageNotFound as exc:
            raise JudgeInfrastructureError(
                'Judge image is not present locally: %s' % image) from exc

    def _inside_root(self, path):
        resolved = Path(path).resolve()
        try:
            resolved.relative_to(self.work_root)
        except ValueError as exc:
            raise JudgeInfrastructureError(
                'Judge bind path escapes the configured work root') from exc
        return resolved

    def cleanup_submission(self, submission_id):
        """Remove only orphan containers carrying this controller's labels."""
        label_filters = [
            'com.algospot.judge=true',
            'com.algospot.judge.submission=%s' % submission_id,
        ]
        try:
            containers = self.client.containers.list(
                all=True, filters={'label': label_filters})
            for container in containers:
                container.remove(force=True)
        except DockerException as exc:
            raise JudgeInfrastructureError(
                'Cannot clean orphan judge containers: %s' % exc) from exc

    def run(self, *, image, command, work_dir, input_path=None,
            wall_seconds, cpu_seconds, memory_bytes,
            file_bytes=64 * 1024 * 1024,
            output_bytes=4 * 1024 * 1024, processes=64,
            work_read_only=False, address_space_limit=True,
            submission_id=None, phase='run'):
        """Run one fixed command and return the monitor's structured result."""
        self._validate_image(image)
        work_dir = self._inside_root(work_dir)
        if not work_dir.is_dir():
            raise JudgeInfrastructureError('Judge work directory is missing')

        volumes = {
            str(work_dir): {'bind': '/work', 'mode': 'ro' if work_read_only else 'rw'},
        }
        runner_input = None
        if input_path is not None:
            input_path = self._inside_root(input_path)
            if not input_path.is_file():
                raise JudgeInfrastructureError('Judge input file is missing')
            volumes[str(input_path)] = {'bind': '/case/input', 'mode': 'ro'}
            runner_input = '/case/input'

        runner_command = [
            '--wall-seconds', str(float(wall_seconds)),
            '--cpu-seconds', str(max(1, int(cpu_seconds))),
            '--memory-bytes', str(int(memory_bytes)),
            '--file-bytes', str(int(file_bytes)),
            '--output-bytes', str(int(output_bytes)),
            '--processes', str(int(processes)),
        ]
        if runner_input:
            runner_command.extend(['--input', runner_input])
        if not address_space_limit:
            runner_command.append('--no-address-space-limit')
        runner_command.extend(['--'] + list(command))

        name = 'algospot-judge-%s-%s' % (
            phase, uuid.uuid4().hex[:16])
        labels = {
            'com.algospot.judge': 'true',
            'com.algospot.judge.phase': phase,
        }
        if submission_id is not None:
            labels['com.algospot.judge.submission'] = str(submission_id)

        container = None
        try:
            container = self.client.containers.create(
                image=image,
                command=runner_command,
                name=name,
                labels=labels,
                runtime=self.runtime,
                network_mode='none',
                read_only=True,
                user='65532:65532',
                cap_drop=['ALL'],
                security_opt=['no-new-privileges:true'],
                pids_limit=max(16, int(processes) + 8),
                mem_limit=int(memory_bytes),
                memswap_limit=int(memory_bytes),
                nano_cpus=1000000000,
                tmpfs={
                    '/tmp': 'rw,noexec,nosuid,nodev,size=64m,mode=1777',
                },
                volumes=volumes,
                working_dir='/work',
                stdin_open=False,
                tty=False,
                detach=True,
            )
            container.start()
            try:
                status = container.wait(timeout=float(wall_seconds) + 5.0)
            except (ReadTimeout, APIError, DockerException):
                try:
                    container.kill()
                except DockerException:
                    pass
                raise JudgeInfrastructureError(
                    'Judge container exceeded its controller deadline')

            container.reload()
            state = container.attrs.get('State', {})
            logs = container.logs(stdout=True, stderr=True)
            if state.get('OOMKilled'):
                return {
                    'returncode': status.get('StatusCode', 137),
                    'timed_out': False,
                    'oom_killed': True,
                    'stdout': b'',
                    'stderr': b'',
                    'wall_seconds': 0,
                    'cpu_seconds': 0,
                    'max_rss_kb': int(memory_bytes) // 1024,
                    'output_limit_exceeded': False,
                }
            try:
                payload = json.loads(logs.decode('utf-8').strip())
            except (UnicodeDecodeError, ValueError) as exc:
                raise JudgeInfrastructureError(
                    'Judge monitor returned invalid output: %r' % logs[:500]) from exc
            payload['stdout'] = base64.b64decode(payload.pop('stdout_b64'))
            payload['stderr'] = base64.b64decode(payload.pop('stderr_b64'))
            payload['oom_killed'] = False
            return payload
        except (APIError, DockerException) as exc:
            raise JudgeInfrastructureError(
                'Docker rejected the judge container: %s' % exc) from exc
        finally:
            if container is not None:
                try:
                    container.remove(force=True)
                except DockerException:
                    pass
