import os
from pathlib import Path
import shutil

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from judge.container_languages import (
    DEFAULT_PYPY2_IMAGE,
    DEFAULT_PYTHON2_IMAGE,
    DEFAULT_TOOLCHAIN_IMAGE,
    get_language,
)
from judge.docker_executor import DisposableContainerExecutor


class Command(BaseCommand):
    help = 'Run controlled isolation checks; runc here is never for submissions'

    def add_arguments(self, parser):
        parser.add_argument('--runtime', default='runsc')
        parser.add_argument('--allow-runc', action='store_true')

    def handle(self, *args, **options):
        runtime = options['runtime']
        if runtime == 'runc' and not options['allow_runc']:
            raise CommandError('runc requires the explicit --allow-runc smoke opt-in')
        root = Path(settings.JUDGE_CONTAINER_WORK_ROOT).resolve()
        root.mkdir(parents=True, exist_ok=True)
        smoke = root / ('controlled-smoke-%s' % os.getpid())
        smoke.mkdir(mode=0o777)
        smoke.chmod(0o777)
        executor = DisposableContainerExecutor(
            runtime=runtime,
            work_root=root,
            allow_runc=options['allow_runc'],
            require_digest=False,
        )
        try:
            source = smoke / 'smoke.py'
            source.write_text(
                "import socket, sys\n"
                "body = sys.stdin.read().strip()\n"
                "try:\n"
                "    socket.create_connection(('1.1.1.1', 53), 0.2)\n"
                "    network = 'OPEN'\n"
                "except Exception:\n"
                "    network = 'BLOCKED'\n"
                "print(body + ':' + network)\n",
                encoding='utf-8')
            source.chmod(0o444)
            input_path = smoke / 'input'
            input_path.write_text('algospot\n', encoding='ascii')
            input_path.chmod(0o444)
            result = executor.run(
                image=DEFAULT_TOOLCHAIN_IMAGE,
                command=('python3', '/work/smoke.py'),
                work_dir=smoke,
                input_path=input_path,
                wall_seconds=2,
                cpu_seconds=1,
                memory_bytes=128 * 1024 * 1024,
                work_read_only=True,
                phase='controlled-smoke',
            )
            if result['returncode'] != 0 or result['stdout'].strip() != b'algospot:BLOCKED':
                raise CommandError('Network/read-run smoke failed: %r' % result)

            legacy_source = smoke / 'legacy.py'
            legacy_source.write_text(
                "import sys\nprint sys.stdin.read().strip() + ':LEGACY'\n",
                encoding='ascii')
            legacy_source.chmod(0o444)
            for image, interpreter in (
                    (DEFAULT_PYTHON2_IMAGE, 'python'),
                    (DEFAULT_PYPY2_IMAGE, 'pypy')):
                legacy_result = executor.run(
                    image=image,
                    command=(interpreter, '/work/legacy.py'),
                    work_dir=smoke,
                    input_path=input_path,
                    wall_seconds=2,
                    cpu_seconds=1,
                    memory_bytes=256 * 1024 * 1024,
                    work_read_only=True,
                    phase='controlled-legacy-smoke',
                )
                if (legacy_result['returncode'] != 0 or
                        legacy_result['stdout'].strip() != b'algospot:LEGACY'):
                    raise CommandError(
                        'Legacy interpreter smoke failed: %r' % legacy_result)

            c_source = smoke / 'smoke.c'
            c_source.write_text(
                '#include <stdio.h>\n'
                'int main(void) { char s[32]; if (!fgets(s, sizeof(s), stdin)) '
                'return 2; printf("%s", s); return 0; }\n',
                encoding='ascii')
            c_source.chmod(0o444)
            compile_result = executor.run(
                image=DEFAULT_TOOLCHAIN_IMAGE,
                command=('gcc', '/work/smoke.c', '-o', '/work/smoke-c'),
                work_dir=smoke,
                wall_seconds=10,
                cpu_seconds=10,
                memory_bytes=512 * 1024 * 1024,
                phase='controlled-compile-smoke',
            )
            if compile_result['returncode'] != 0:
                raise CommandError('Compile smoke failed: %r' % compile_result)
            compiled_result = executor.run(
                image=DEFAULT_TOOLCHAIN_IMAGE,
                command=('/work/smoke-c',),
                work_dir=smoke,
                input_path=input_path,
                wall_seconds=2,
                cpu_seconds=1,
                memory_bytes=128 * 1024 * 1024,
                work_read_only=True,
                phase='controlled-compiled-run-smoke',
            )
            if (compiled_result['returncode'] != 0 or
                    compiled_result['stdout'].strip() != b'algospot'):
                raise CommandError(
                    'Compiled run smoke failed: %r' % compiled_result)

            matrix_sources = {
                'cpp': '#include <iostream>\nint main(){std::cout << std::cin.rdbuf();}\n',
                'go': ('package main\nimport ("io"; "os")\n'
                       'func main(){io.Copy(os.Stdout, os.Stdin)}\n'),
                'hs': 'main = interact id\n',
                'java': (
                    'public class Main { public static void main(String[] a) '
                    'throws Exception { byte[] b=new byte[4096]; int n; '
                    'while((n=System.in.read(b))!=-1) System.out.write(b,0,n); }}\n'),
                'js': 'process.stdin.pipe(process.stdout);\n',
                'lua': 'io.write(io.read("*a"))\n',
                'rb': 'STDOUT.write(STDIN.read)\n',
                'rs': (
                    'use std::io::{self, Read, Write}; fn main(){let mut b=Vec::new();'
                    'io::stdin().read_to_end(&mut b).unwrap();'
                    'io::stdout().write_all(&b).unwrap();}\n'),
                'scala': (
                    'object Main extends App { print(scala.io.Source.stdin.mkString) }\n'),
            }
            for extension, body in sorted(matrix_sources.items()):
                spec = get_language(extension)
                language_dir = smoke / ('language-' + extension)
                language_dir.mkdir(mode=0o777)
                language_dir.chmod(0o777)
                language_source = language_dir / spec.source_name
                language_source.write_text(body, encoding='ascii')
                language_source.chmod(0o444)
                if spec.compile_command:
                    language_compile = executor.run(
                        image=spec.image,
                        command=spec.compile_command,
                        work_dir=language_dir,
                        wall_seconds=spec.compile_wall_seconds,
                        cpu_seconds=spec.compile_wall_seconds,
                        memory_bytes=spec.compile_memory_bytes,
                        processes=128,
                        address_space_limit=spec.address_space_limit,
                        phase='controlled-%s-compile-smoke' % extension,
                    )
                    if language_compile['returncode'] != 0:
                        raise CommandError(
                            '%s compile smoke failed: %r' % (
                                extension, language_compile))
                language_result = executor.run(
                    image=spec.image,
                    command=spec.format_run_command(262144),
                    work_dir=language_dir,
                    input_path=input_path,
                    wall_seconds=5,
                    cpu_seconds=5,
                    memory_bytes=262144 * 1024 + spec.runtime_overhead_bytes,
                    processes=64,
                    work_read_only=True,
                    address_space_limit=spec.address_space_limit,
                    phase='controlled-%s-run-smoke' % extension,
                )
                if (language_result['returncode'] != 0 or
                        language_result['stdout'] != b'algospot\n'):
                    raise CommandError(
                        '%s run smoke failed: %r' % (
                            extension, language_result))

            timeout_source = smoke / 'timeout.py'
            timeout_source.write_text('while True: pass\n', encoding='ascii')
            timeout_source.chmod(0o444)
            timeout_result = executor.run(
                image=DEFAULT_TOOLCHAIN_IMAGE,
                command=('python3', '/work/timeout.py'),
                work_dir=smoke,
                wall_seconds=0.25,
                cpu_seconds=1,
                memory_bytes=128 * 1024 * 1024,
                work_read_only=True,
                phase='controlled-timeout-smoke',
            )
            if not timeout_result['timed_out']:
                raise CommandError('Deadline smoke did not time out: %r' % timeout_result)
            self.stdout.write(self.style.SUCCESS(
                'Disposable-container smoke passed (%s, no network, deadline enforced).'
                % runtime))
        finally:
            shutil.rmtree(str(smoke), ignore_errors=True)
