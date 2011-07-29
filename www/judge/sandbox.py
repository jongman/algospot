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
import time
from os.path import expanduser, exists, split, join, abspath, dirname

def makedir(path):
    path = expanduser(path)
    if not exists(path):
        os.makedirs(path)
    return path

class TimeOutException(Exception):
    pass

def execute(command, redirect=True, time_limit=None):
    """ time_limit must be in seconds """
    assert isinstance(command, list)
    kwargs = {"close_fds": True}
    if redirect:
        kwargs["stdout"] = kwargs["stderr"] = subprocess.PIPE
    #print "RUN:", command
    popen = subprocess.Popen(command, **kwargs)
    if not time_limit:
        wait = popen.wait()
    else:
        start = time.time()
        # 실제 수행하는 데는 2초를 더 준다.
        while time.time() < start + time_limit + 2 and popen.poll() is None:
            time.sleep(0.1)
        wait = popen.poll()
        if wait is None:
            popen.kill()
            raise TimeOutException
    ret = {"returncode": wait}
    if redirect:
        ret["stdout"] = popen.stdout.read()
        ret["stderr"] = popen.stderr.read()
    return ret

def get_sandbox(memory_limit):
    assert 1024 <= memory_limit <= 1024*1024*2, "memory_limit should be in kilobytes"
    from django.conf import settings
    SETTINGS = settings.JUDGE_SETTINGS
    assert SETTINGS["SANDBOX"] == "LXC"
    return LXCSandbox(SETTINGS["USER"], SETTINGS["FILESYSTEMSIZE"], memory_limit)

# TODO: 모든 용량 기준 킬로바이트로 통일
class LXCSandbox(object):
    def __init__(self, user, fs_size=65536, memory_limit=65536, home_type="bind"):
        assert os.geteuid() == 0
        self.mounts = []
        self.user = pwd.getpwnam(user)
        self.isolate_filesystem(fs_size, home_type)
        self.generate_config(memory_limit)

    def generate_config(self, memory_limit):
        self.memory_limit = memory_limit
        self.config = join(self.root, "config")
        # 실제 디바이스에는 10MB 를 더 준다
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
lxc.cgroup.memory.limit_in_bytes = %dK
lxc.cgroup.memory.memsw.limit_in_bytes = %dK
                """ % (self.name, self.root_mount, memory_limit + 10240,
                       memory_limit + 10240))
        f.close()


    def mount(self, source, destination, fstype, options=None):
        #print "mount src=%s dest=%s type=%s options=%s" % (source, destination, fstype, options)
        cmd = ["mount", "-t", fstype, source, destination]
        if options:
            cmd += ["-o", options]
        execute(cmd)
        self.mounts.append(destination)

    def isolate_filesystem(self, fs_size, home_type):
        self.root = tempfile.mkdtemp(dir=makedir("~/.sandbox"))
        print "sandbox root", self.root
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
        self.new_home_cow = expanduser(join(self.workdir, "user-home-cow"))
        self.mount_home(home_type)

    def mount_home(self, home_type):
        if self.mounts and self.mounts[-1] == self.home_in_mounted:
            execute(["umount", self.home_in_mounted])
            self.mounts.pop()

        if home_type == "bind":
            self.mount(self.new_home, self.home_in_mounted, "none", "bind")
        else:
            if exists(self.new_home_cow):
                shutil.rmtree(self.new_home_cow)
            makedir(self.new_home_cow)
            self.mount("none", self.home_in_mounted, "aufs", "br=%s:%s" %
                       (self.new_home_cow, self.new_home))

        os.chown(self.home_in_mounted, self.user.pw_uid, self.user.pw_gid)
        os.chmod(self.home_in_mounted, 0o700)

    def teardown(self):
        for destination in reversed(self.mounts):
            execute(["umount", destination])

        #if os.path.exists(self.root): shutil.rmtree(self.root)

    def get_file_path(self, in_home):
        return join(self.home_in_mounted, in_home)

    def put_file(self, source, destination, permission=None):
        "Put a file into user's home directory"
        target = join(self.home_in_mounted, destination)
        shutil.copy(source, target)
        os.chown(target, self.user.pw_uid, self.user.pw_gid)
        if permission:
            os.chmod(target, permission)

    def write_file(self, text, destination, permission=None):
        "Create a file in user's home directory with given contents"
        target = join(self.home_in_mounted, destination)
        open(target, "w").write(text.encode("utf-8"))
        os.chown(target, self.user.pw_uid, self.user.pw_gid)
        if permission:
            os.chmod(target, permission)

    def read_file(self, file):
        "Reads a file from user's home directory"
        return open(join(self.home_in_mounted, file)).read()

    def create_entrypoint(self, command):
        entrypoint = join(self.home_in_mounted, "entrypoint.sh")
        #print "ENTRYPOINT", command
        content = "\n".join(["#!/bin/sh",
                             "rm $0",
                             "RET=$?",
                             "reset -I 2> /dev/null",
                             "cd",
                             command,
                             "pkill -P 1 2> /dev/null",
                             "exit $RET"])
        fp = open(entrypoint, "w")
        fp.write(content)
        fp.close()
        os.chown(entrypoint, self.user.pw_uid, self.user.pw_gid)

    def run_interactive(self, command):
        "Runs an interactive command in the sandbox"
        # 에.. 이건 왜켜냐
        self.create_entrypoint(command)
        return self._run(False)

    def run(self, command, stdin=None, stdout=None, stderr=None, time_limit=None):
        # 모니터를 샌드박스 안에 집어넣는다
        self.put_file(os.path.join(os.path.dirname(__file__), "monitor.py"),
                       "monitor.py")
        cmd = ["python", "~/monitor.py"]
        if stdin: cmd += ["-i", stdin]
        if stdout: cmd += ["-o", stdout]
        if stderr: cmd += ["-e", stderr]
        cmd.append('"%s"' % command)

        self.create_entrypoint(" ".join(cmd))
        try:
            result = self._run(True, time_limit)
            if (result["returncode"] != 0 or
                    result["stderr"].strip() or
                    not result["stdout"].strip() or
                    result["stdout"].split()[0] not in ["RTE", "MLE", "OK"]):
                raise Exception("Unexpected monitor result:\n" + str(result))
        except TimeOutException:
            return "TLE"
        #print "RESULT", result
        toks = result["stdout"].split()
        if toks[0] == "OK":
            time_used, memory_used = map(float, toks[1:3])
            if time_limit is not None and time_used >= time_limit:
                return u"TLE (샌드박스 밖에서 확인)"
            if memory_used >= self.memory_limit:
                return u"MLE (샌드박스 밖에서 확인)"
        return result["stdout"]

    def _run(self, redirect, time_limit=None):
        signal.signal(signal.SIGTTOU, signal.SIG_IGN)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        current_path = abspath(dirname(__file__))
        return execute(["lxc-start",
                        "-n", self.name,
                        "-f", self.config,
                        "-o", join(current_path, "lxc.log"),
                        "-l", "INFO",
                        "su", self.user.pw_name, "-c", "sh", join(self.user.pw_dir, "entrypoint.sh")],
                       redirect=redirect,
                       time_limit=time_limit)

def main():
    def print_result(x):
        print "RETURN CODE: %d" % x["returncode"]
        for key in x.keys():
            if x[key]:
                print key, "============"
                print x[key]

    try:
        """
        sandbox = LXCSandbox("runner", home_type="bind")
        sandbox.run_interactive("bash")
        sandbox.mount_home("cow")
        sandbox.run_interactive("bash")
        sandbox.mount_home("cow")
        sandbox.run_interactive("bash")
        """
        sandbox = LXCSandbox("runner", memory_limit=65536, home_type="bind")
        import sys
        for file in sys.argv[1:]:
            sandbox.put_file(file, os.path.basename(file))
        sandbox.put_file("dp.cpp", "dp.cpp", 0o700)
        sandbox.put_file("inp", "inp")
        print sandbox.run("g++ -O3 dp.cpp -o dp", stdout=".compile.stdout",
                                 stderr=".compile.stderr")
        print sandbox.run("./dp", "inp", ".stdout", ".stderr")
    finally:
        sandbox.teardown()

if __name__ == "__main__":
    main()
