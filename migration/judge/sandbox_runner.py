#!/usr/bin/env python3
"""Trusted in-container process monitor for one compile or execution step."""

import argparse
import base64
import json
import os
import resource
import signal
import subprocess
import sys
import tempfile
import time


monotonic = getattr(time, 'monotonic', time.time)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--wall-seconds', type=float, required=True)
    parser.add_argument('--cpu-seconds', type=int, required=True)
    parser.add_argument('--memory-bytes', type=int, required=True)
    parser.add_argument('--file-bytes', type=int, required=True)
    parser.add_argument('--output-bytes', type=int, required=True)
    parser.add_argument('--processes', type=int, required=True)
    parser.add_argument('--open-files', type=int, default=64)
    parser.add_argument('--input')
    parser.add_argument('--no-address-space-limit', action='store_true')
    parser.add_argument('command', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if args.command and args.command[0] == '--':
        args.command = args.command[1:]
    if not args.command:
        parser.error('a command is required after --')
    return args


def child_limits(args):
    os.setsid()
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    resource.setrlimit(
        resource.RLIMIT_CPU, (args.cpu_seconds, args.cpu_seconds + 1))
    resource.setrlimit(
        resource.RLIMIT_FSIZE, (args.file_bytes, args.file_bytes))
    resource.setrlimit(
        resource.RLIMIT_NPROC, (args.processes, args.processes))
    resource.setrlimit(
        resource.RLIMIT_NOFILE, (args.open_files, args.open_files))
    if not args.no_address_space_limit:
        resource.setrlimit(
            resource.RLIMIT_AS, (args.memory_bytes, args.memory_bytes))


def read_bounded(path, limit):
    with open(path, 'rb') as stream:
        return stream.read(limit)


def main():
    args = parse_args()
    started = monotonic()
    usage_before = resource.getrusage(resource.RUSAGE_CHILDREN)
    stdout_path = tempfile.mktemp(prefix='stdout-', dir='/tmp')
    stderr_path = tempfile.mktemp(prefix='stderr-', dir='/tmp')
    timed_out = False

    stdin = open(args.input, 'rb') if args.input else open(os.devnull, 'rb')
    stdout = open(stdout_path, 'wb')
    stderr = open(stderr_path, 'wb')
    try:
        process = subprocess.Popen(
            args.command,
            cwd='/work',
            stdin=stdin,
            stdout=stdout,
            stderr=stderr,
            close_fds=True,
            env={
                'HOME': '/tmp',
                'LANG': 'C.UTF-8',
                'LC_ALL': 'C.UTF-8',
                'GOMAXPROCS': '1',
                'OPENBLAS_NUM_THREADS': '1',
                'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
                'TMPDIR': '/tmp',
            },
            preexec_fn=lambda: child_limits(args),
        )
        deadline = started + args.wall_seconds
        while process.poll() is None and monotonic() < deadline:
            time.sleep(0.01)
        if process.poll() is None:
            timed_out = True
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except OSError:
                pass
        returncode = process.wait()
    finally:
        stdin.close()
        stdout.close()
        stderr.close()

    usage_after = resource.getrusage(resource.RUSAGE_CHILDREN)
    stdout_body = read_bounded(stdout_path, args.output_bytes)
    stderr_body = read_bounded(stderr_path, args.output_bytes)
    stdout_size = os.path.getsize(stdout_path)
    stderr_size = os.path.getsize(stderr_path)
    result = {
        'returncode': returncode,
        'signal': -returncode if returncode < 0 else None,
        'timed_out': timed_out,
        'wall_seconds': monotonic() - started,
        'cpu_seconds': (
            usage_after.ru_utime + usage_after.ru_stime
            - usage_before.ru_utime - usage_before.ru_stime
        ),
        'max_rss_kb': usage_after.ru_maxrss,
        'stdout_b64': base64.b64encode(stdout_body).decode('ascii'),
        'stderr_b64': base64.b64encode(stderr_body).decode('ascii'),
        'stdout_size': stdout_size,
        'stderr_size': stderr_size,
        'output_limit_exceeded': (
            stdout_size >= args.output_bytes
            or stderr_size >= args.output_bytes
        ),
    }
    sys.stdout.write(json.dumps(result, sort_keys=True))
    sys.stdout.write('\n')
    return 0


if __name__ == '__main__':
    sys.exit(main())
