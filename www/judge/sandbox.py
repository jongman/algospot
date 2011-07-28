#!/usr/bin/python
# -*- coding: utf-8 -*-

""" This is a stripped-down version of Arkose:
    https://launchpad.net/arkose
    """

import os
import pwd
import tempfile
import shutil
import signal
import subprocess
from os.path import expanduser, exists, split, join, abspath, dirname

def makedir(path):
    path = expanduser(path)
    if not exists(path):
        os.makedirs(path)
    return path

def execute(command, redirect=True):
    assert isinstance(command, list)
    kwargs = {}
    if redirect:
        kwargs["stdout"] = kwargs["stderr"] = subprocess.PIPE
    print "RUN:", command
    popen = subprocess.Popen(command, **kwargs)
    wait = popen.wait()
    if wait != 0:
        print "NONZERO RETURN CODE!!!", wait
    ret = {"returncode": wait}
    if redirect:
        ret["stdout"] = popen.stdout.read()
        ret["stderr"] = popen.stderr.read()
    return ret

def get_sandbox(memory_limit):
    from django.conf import settings
    SETTINGS = settings.JUDGE_SETTINGS
    assert SETTINGS["Sandbox"] == "LXC"
    return LXCSandbox(SETTINGS["User"], SETTINGS["FileSystemSize"],
                      memory_limit / 1024, SETTINGS["SwapSize"])

class LXCSandbox(object):
    def __init__(self, user, fs_size=64, memory_limit=64, swap_size=64):
        assert os.geteuid() == 0
        self.mounts = []
        self.user = pwd.getpwnam(user)
        self.isolate_filesystem(fs_size)
        self.generate_config(memory_limit, swap_size)

    def generate_config(self, memory_limit, swap_size):
        self.config = join(self.root, "config")
        f = open(self.config, "w")
        f.write("""
lxc.utsname = %s
lxc.tty = 4
lxc.pts = 1024
lxc.rootfs = %s

## /dev filtering
lxc.cgroup.devices.deny = a
# /dev/null and zero
lxc.cgroup.devices.allow = c 1:3 rwm
lxc.cgroup.devices.allow = c 1:5 rwm
# consoles
lxc.cgroup.devices.allow = c 5:1 rwm
lxc.cgroup.devices.allow = c 5:0 rwm
lxc.cgroup.devices.allow = c 4:0 rwm
lxc.cgroup.devices.allow = c 4:1 rwm
# /dev/{,u}random
lxc.cgroup.devices.allow = c 1:9 rwm
lxc.cgroup.devices.allow = c 1:8 rwm
lxc.cgroup.devices.allow = c 136:* rwm
lxc.cgroup.devices.allow = c 5:2 rwm
# rtc
lxc.cgroup.devices.allow = c 254:0 rwm
## Networking
lxc.network.type = empty
## Limit max memory
lxc.cgroup.memory.limit_in_bytes = %dM
lxc.cgroup.memory.memsw.limit_in_bytes = %dM
                """ % (self.name, self.root_mount, memory_limit, swap_size))
        f.close()


    def mount(self, source, destination, fstype, options=None):
        print "mount src=%s dest=%s type=%s options=%s" % (source, destination,
                                                           fstype, options)
        cmd = ["mount", "-t", fstype, source, destination]
        if options:
            cmd += ["-o", options]
        execute(cmd)
        self.mounts.append(destination)

    def isolate_filesystem(self, fs_size):
        self.root = tempfile.mkdtemp(dir=makedir("~/.sandbox"))
        os.chmod(self.root, 0o755)

        self.name = "sandbox-%s" % split(self.root)[1]

        # 워킹 디렉토리: 모든 디렉토리 마운트를 포함. COW 와 restrict
        # 데이터는 워킹 디렉토리의 쿼터에 포함된다.
        self.workdir = makedir(join(self.root, "workdir"))
        self.mount("none", self.workdir, "tmpfs", "size=%d" % (fs_size << 20))

        # LXC 용 cgroup 생성
        self.cgroup = makedir(join(self.workdir, "cgroup"))
        self.mount("cgroup", self.cgroup, "cgroup")

        # 루트 디렉토리를 copy-on-write 로 마운트한다.
        # root_mount 위치에 마운트하되, 여기에서 고친 내역은 root_cow
        # 위치에 저장된다.
        self.root_mount = makedir(join(self.workdir, "root-mount"))
        self.root_cow = makedir(join(self.workdir, "root-cow"))
        self.mount("none", self.root_mount, "aufs", "br=%s:/" % self.root_cow)

        # 빈 디렉토리 user-home 을 만들고, 마운트된 cow 루트 내의 홈디렉토리를
        # 이걸로 덮어씌운다.
        home_path = self.user.pw_dir.lstrip("/")
        self.new_home = makedir(join(self.workdir, "user-home"))
        self.home_in_mounted = makedir(join(self.root_mount, home_path))
        self.mount(self.new_home, self.home_in_mounted, "none", "bind")
        os.chown(self.home_in_mounted, self.user.pw_uid, self.user.pw_gid)
        os.chmod(self.home_in_mounted, 0o700)

    def teardown(self):
        for destination in reversed(self.mounts):
            execute(["umount", destination])

        if os.path.exists(self.root):
            shutil.rmtree(self.root)

    def copy_file(self, source, destination, permission=None):
        "Put a file into user's home directory"
        target = join(self.home_in_mounted, destination)
        shutil.copy(source, target)
        os.chown(target, self.user.pw_uid, self.user.pw_gid)
        if permission:
            os.chmod(target, permission)

    def get_file(self, file):
        "Reads a file from user's home directory"
        return open(join(self.home_in_mounted, file)).read()

    def create_entrypoint(self, command):
        entrypoint = join(self.home_in_mounted, "entrypoint.sh")
        content = "\n".join(["#!/bin/sh",
                             "rm $0",
                             "RET=$?",
                             "reset -I 2> /dev/null",
                             command,
                             "pkill -P 1 2> /dev/null",
                             "exit $RET"])
        fp = open(entrypoint, "w")
        fp.write(content)
        fp.close()
        os.chown(entrypoint, self.user.pw_uid, self.user.pw_gid)

    def run(self, command, interactive=False):
        "Runs a command in the sandbox"
        # 에.. 이건 왜켜냐
        signal.signal(signal.SIGTTOU, signal.SIG_IGN)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        current_path = abspath(dirname(__file__))
        self.create_entrypoint(command)
        return execute(["lxc-start",
                        "-n", self.name,
                        "-f", self.config,
                        "-o", join(current_path, "lxc.log"),
                        "-l", "INFO",
                        "su", self.user.pw_name, "-c", "sh", join(self.user.pw_dir, "entrypoint.sh")],
                       redirect=not interactive)

def main():
    from os.path import basename
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("files", nargs="*")
    parser.add_argument("--interactive", "-i", action="store_true",
                        default=False)
    parser.add_argument("--command", "-c", nargs=1, default=["bash"])
    args = parser.parse_args()
    print args
    try:
        sandbox = None
        sandbox = LXCSandbox("runner")
        for file in args.files:
            sandbox.copy_file(file, basename(file))
        ret = sandbox.run(" ".join(args.command), args.interactive)
        if not args.interactive:
            print "Stdout"
            print ret["stdout"]
            print "Stderr"
            print ret["stderr"]
    finally:
        if sandbox:
            sandbox.teardown()

if __name__ == "__main__":
    main()
