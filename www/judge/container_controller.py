"""Durable judge queue consumer and disposable-container orchestration."""

from datetime import timedelta
import math
import os
from pathlib import Path
import shutil
import socket
import time
import traceback

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .container_data import compare_output, prepare_problem_data
from .container_languages import DEFAULT_PYTHON2_IMAGE, get_language
from .docker_executor import DisposableContainerExecutor
from .models import JudgeJob, Submission


LEASE_SECONDS = 3600
MAX_SOURCE_BYTES = 1024 * 1024
MAX_MESSAGE_BYTES = 64 * 1024


def _message(body):
    if isinstance(body, bytes):
        body = body.decode('utf-8', 'replace')
    return body[:MAX_MESSAGE_BYTES]


class JudgeController:
    def __init__(self, runtime=None, allow_runc=False, require_digest=None,
                 worker_id=None):
        self.work_root = Path(settings.JUDGE_CONTAINER_WORK_ROOT).resolve()
        self.work_root.mkdir(parents=True, exist_ok=True)
        self.runtime = runtime or settings.JUDGE_CONTAINER_RUNTIME
        if require_digest is None:
            require_digest = settings.JUDGE_REQUIRE_IMAGE_DIGESTS
        self.executor = DisposableContainerExecutor(
            runtime=self.runtime,
            work_root=self.work_root,
            allow_runc=allow_runc,
            require_digest=require_digest,
        )
        self.worker_id = worker_id or '%s:%s' % (socket.gethostname(), os.getpid())

    def claim(self):
        now = timezone.now()
        with transaction.atomic():
            job = (JudgeJob.objects.select_for_update(skip_locked=True)
                   .filter(Q(state=JudgeJob.PENDING) |
                           Q(state=JudgeJob.RUNNING, lease_expires_at__lt=now))
                   .select_related('submission', 'submission__problem',
                                   'submission__problem__last_revision')
                   .order_by('created_at').first())
            if job is None:
                return None
            job.state = JudgeJob.RUNNING
            job.worker_id = self.worker_id
            job.lease_expires_at = now + timedelta(seconds=LEASE_SECONDS)
            job.attempts += 1
            job.last_error = ''
            job.save(update_fields=[
                'state', 'worker_id', 'lease_expires_at', 'attempts',
                'last_error', 'updated_at',
            ])
            return job.id

    def heartbeat(self, job_id):
        updated = JudgeJob.objects.filter(
            id=job_id, state=JudgeJob.RUNNING, worker_id=self.worker_id,
        ).update(lease_expires_at=timezone.now() + timedelta(seconds=LEASE_SECONDS))
        if updated != 1:
            raise RuntimeError('Judge lease was lost')

    def _set_submission(self, submission, state, message='', time_ms=None,
                        memory_kb=None):
        submission.state = state
        submission.message = _message(message)
        submission.time = time_ms
        submission.memory = memory_kb
        submission.save(update_fields=['state', 'message', 'time', 'memory'])

    def _special_compare(self, job_id, submission, prepared, case, output,
                         job_root):
        if prepared.checker_path is None:
            raise RuntimeError('Special judge checker attachment is missing')
        checker_dir = job_root / ('checker-%s' % case.name)
        checker_dir.mkdir(mode=0o777)
        checker_dir.chmod(0o777)
        for source, name in (
            (prepared.checker_path, 'checker'),
            (case.input_path, 'input'),
            (case.expected_path, 'expected'),
        ):
            shutil.copyfile(str(source), str(checker_dir / name))
            (checker_dir / name).chmod(0o444)
        (checker_dir / 'output').write_bytes(output)
        (checker_dir / 'output').chmod(0o444)
        result = self.executor.run(
            image=DEFAULT_PYTHON2_IMAGE,
            command=(
                'python', '/work/checker', '/work/input', '/work/output',
                '/work/expected',
            ),
            work_dir=checker_dir,
            wall_seconds=10,
            cpu_seconds=10,
            memory_bytes=256 * 1024 * 1024,
            output_bytes=1024 * 1024,
            processes=16,
            work_read_only=True,
            submission_id=submission.id,
            phase='checker',
        )
        if result['timed_out'] or result['oom_killed'] or result['returncode'] != 0:
            raise RuntimeError('Special judge checker failed: %s' %
                               _message(result['stderr']))
        return result['stdout'].strip() == b'YES'

    def process(self, job_id):
        job = JudgeJob.objects.select_related(
            'submission', 'submission__problem',
            'submission__problem__last_revision').get(id=job_id)
        submission = job.submission
        problem = submission.problem
        revision = problem.last_revision
        if revision is None:
            raise RuntimeError('Problem has no active revision')
        recoverable_states = (
            Submission.RECEIVED,
            Submission.REJUDGE_REQUESTED,
            Submission.COMPILING,
            Submission.RUNNING,
            Submission.JUDGING,
        )
        if submission.state not in recoverable_states:
            raise RuntimeError('Submission is not queued for judging')

        self.executor.cleanup_submission(submission.id)

        spec = get_language(submission.language)
        source = submission.source.encode('utf-8')
        if len(source) > MAX_SOURCE_BYTES:
            raise RuntimeError('Submission source exceeds the 1 MiB limit')

        job_root = self.work_root / ('submission-%s-%s' % (submission.id, job.id))
        if job_root.exists():
            shutil.rmtree(str(job_root))
        job_root.mkdir(mode=0o700)
        work_dir = job_root / 'work'
        work_dir.mkdir(mode=0o777)
        work_dir.chmod(0o777)
        source_path = work_dir / spec.source_name
        source_path.write_bytes(source)
        source_path.chmod(0o444)

        try:
            prepared = prepare_problem_data(problem, job_root / 'data')
            self._set_submission(submission, Submission.COMPILING)
            if spec.compile_command:
                compile_result = self.executor.run(
                    image=spec.image,
                    command=spec.compile_command,
                    work_dir=work_dir,
                    wall_seconds=spec.compile_wall_seconds,
                    cpu_seconds=spec.compile_wall_seconds,
                    memory_bytes=spec.compile_memory_bytes,
                    output_bytes=MAX_MESSAGE_BYTES,
                    processes=128,
                    address_space_limit=spec.address_space_limit,
                    submission_id=submission.id,
                    phase='compile',
                )
                if (compile_result['timed_out'] or compile_result['oom_killed'] or
                        compile_result['returncode'] != 0):
                    self._set_submission(
                        submission, Submission.COMPILE_ERROR,
                        compile_result['stderr'] or compile_result['stdout'])
                    return

            self._set_submission(submission, Submission.RUNNING)
            total_cpu = 0.0
            max_memory = 0
            time_limit = max(0.001, revision.time_limit / 1000.0)
            memory_kb = max(1024, revision.memory_limit)
            for case in prepared.cases:
                self.heartbeat(job_id)
                result = self.executor.run(
                    image=spec.image,
                    command=spec.format_run_command(memory_kb),
                    work_dir=work_dir,
                    input_path=case.input_path,
                    wall_seconds=time_limit,
                    cpu_seconds=max(1, int(math.ceil(time_limit))),
                    memory_bytes=memory_kb * 1024 + spec.runtime_overhead_bytes,
                    output_bytes=16 * 1024 * 1024,
                    processes=64,
                    work_read_only=True,
                    address_space_limit=spec.address_space_limit,
                    submission_id=submission.id,
                    phase='run',
                )
                total_cpu += float(result['cpu_seconds'])
                max_memory = max(max_memory, int(result['max_rss_kb']))
                if result['timed_out']:
                    self._set_submission(submission, Submission.TIME_LIMIT_EXCEEDED)
                    return
                if result['oom_killed']:
                    self._set_submission(
                        submission, Submission.RUNTIME_ERROR,
                        'Memory limit exceeded')
                    return
                if result['output_limit_exceeded']:
                    self._set_submission(
                        submission, Submission.RUNTIME_ERROR,
                        'Output limit exceeded')
                    return
                if result['returncode'] != 0:
                    self._set_submission(
                        submission, Submission.RUNTIME_ERROR, result['stderr'])
                    return
                if total_cpu > time_limit:
                    self._set_submission(submission, Submission.TIME_LIMIT_EXCEEDED)
                    return

                expected = case.expected_path.read_bytes()
                if problem.judge_module == 'special_judge':
                    matches = self._special_compare(
                        job_id, submission, prepared, case, result['stdout'],
                        job_root)
                else:
                    matches = compare_output(
                        problem.judge_module, result['stdout'], expected)
                if not matches:
                    self._set_submission(
                        submission, Submission.WRONG_ANSWER,
                        time_ms=int(total_cpu * 1000), memory_kb=max_memory)
                    return

            self._set_submission(
                submission, Submission.ACCEPTED,
                time_ms=int(total_cpu * 1000), memory_kb=max_memory)
        finally:
            shutil.rmtree(str(job_root), ignore_errors=True)

    def fail(self, job_id, exc):
        details = '%s\n%s' % (exc, traceback.format_exc())
        job = JudgeJob.objects.select_related('submission').get(id=job_id)
        self._set_submission(
            job.submission, Submission.CANT_BE_JUDGED,
            'Judge infrastructure failure: %s' % exc)
        JudgeJob.objects.filter(id=job_id).update(
            state=JudgeJob.FAILED,
            worker_id='',
            lease_expires_at=None,
            last_error=_message(details),
            updated_at=timezone.now(),
        )

    def complete(self, job_id):
        JudgeJob.objects.filter(id=job_id).update(
            state=JudgeJob.COMPLETE,
            worker_id='',
            lease_expires_at=None,
            updated_at=timezone.now(),
        )

    def run_once(self):
        job_id = self.claim()
        if job_id is None:
            return False
        try:
            self.process(job_id)
        except Exception as exc:
            self.fail(job_id, exc)
        else:
            self.complete(job_id)
        return True

    def run_forever(self, poll_seconds=1.0):
        while True:
            if not self.run_once():
                time.sleep(poll_seconds)
