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
import logging
import getpass
import codecs
from os.path import expanduser, exists, split, join, abspath, dirname

def makedir(path):
    path = expanduser(path)
    if not exists(path):
        print 'RUN:', 'mkdir %s' % path
        os.makedirs(path)
    return path

class TimeOutException(Exception):
    pass

def execute(command, redirect=True, time_limit=None, kill_command=[]):
    """ time_limit must be in seconds """
    assert isinstance(command, list)
    kwargs = {"close_fds": True}
    if redirect:
        kwargs["stdout"] = kwargs["stderr"] = subprocess.PIPE
    print "RUN:", ' '.join(command)
    popen = subprocess.Popen(command, **kwargs)
    if not time_limit:
        wait = popen.wait()
    else:
        start = time.time()
        # 실제 수행하는 데는 4초를 더 준다.
        while time.time() < start + time_limit + 4 and popen.poll() is None:
            time.sleep(0.1)
        wait = popen.poll()
        if wait is None:
            if kill_command:
                subprocess.call(kill_command)
                popen.wait()
            else:
                popen.kill()
            raise TimeOutException
    ret = {"returncode": wait}
    if redirect:
        ret["stdout"] = popen.stdout.read()
        ret["stderr"] = popen.stderr.read()
    return ret

def get_sandbox():
    from django.conf import settings
    SETTINGS = settings.JUDGE_SETTINGS
    return Sandbox(SETTINGS["USER"], SETTINGS["FILESYSTEMSIZE"])

# TODO: 모든 용량 기준 킬로바이트로 통일
class Sandbox(object):
    def __init__(self, user, fs_size=65536, home_type="bind"):
        self.am_i_root = os.geteuid() == 0
        if not self.am_i_root:
            logging.warning("Sandbox not running as root: all sandboxing "
                            "functionalities are unavailable.")
            print ("Sandbox not running as root: all sandboxing "
                            "functionalities are unavailable.")
            user = getpass.getuser()
        self.user = pwd.getpwnam(user)
        self.mounts = []
        self.isolate_filesystem(fs_size, home_type)

    def generate_config(self, memory_limit):
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
lxc.cgroup.memory.limit_in_bytes = %dK
lxc.cgroup.memory.memsw.limit_in_bytes = %dK
                """ % (self.name,
                       self.root_mount,
                       memory_limit,
                       memory_limit))
        f.close()


    def mount(self, source, destination, fstype, options=None):
        if not self.am_i_root: return
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

        # 루트 디렉토리를 copy-on-write 로 마운트한다.
        # root_mount 위치에 마운트하되, 여기에서 고친 내역은 root_cow
        # 위치에 저장된다.
        self.root_mount = makedir(join(self.workdir, "root-mount"))
        self.root_cow = makedir(join(self.workdir, "root-cow"))
        self.mount("none", self.root_mount, "aufs", "br=%s:/" % self.root_cow)

        # 일부 프로그램들은 /proc 이 없으면 제대로 동작하지 않는다 (Sun JVM 등)
        self.mount("proc", join(self.root_mount, "proc"), "none", "proc")

        # /dev/shm
        dev_shm = join(self.root_mount, "dev", "shm")
        if exists(dev_shm): os.unlink(dev_shm)
        makedir(dev_shm)
        self.mount("none", dev_shm, "tmpfs")

        # 빈 디렉토리 user-home 을 만들고, 마운트된 cow 루트 내의 홈디렉토리를
        # 이걸로 덮어씌운다.
        home_path = self.user.pw_dir.lstrip("/")
        self.new_home = makedir(join(self.workdir, "user-home"))
        self.home_in_mounted = makedir(join(self.root_mount, home_path))
        self.new_home_cow = expanduser(join(self.workdir, "user-home-cow"))
        self.mount_home(home_type)

    def _umount(self, mounted):
        if not self.am_i_root: return
        if mounted not in self.mounts: return
        execute(["umount", mounted])
        self.mounts.remove(mounted)

    def mount_home(self, home_type):
        self._umount(self.home_in_mounted)

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
        for destination in list(reversed(self.mounts)):
            self._umount(destination)

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
        return codecs.open(join(self.home_in_mounted, file), encoding="utf-8").read()

    def create_entrypoint(self, command, before=[], after=[]):
        entrypoint = join(self.home_in_mounted, "entrypoint.sh")
        print "ENTRYPOINT", command
        content = "\n".join([
            "#!/bin/sh",
            "cd `dirname $0`",
            "rm $0",
            "reset -I 2> /dev/null" if self.am_i_root else ""] +
            before +
            [command] +
            after + [
            "RET=$?",
            "pkill -P 1 2> /dev/null" if self.am_i_root else "",
            "exit $RET"])
        fp = open(entrypoint, "w")
        fp.write(content)
        fp.close()
        os.chown(entrypoint, self.user.pw_uid, self.user.pw_gid)

    def run_interactive(self, command):
        "Runs an interactive command in the sandbox"
        # 에.. 이건 왜켜냐
        self.create_entrypoint(command)
        self.generate_config(74 * 1024)
        return self._run(False)

    def run(self, command, memory_limit, stdin=None, stdout=None, stderr=None,
            time_limit=None, before=[], after=[]):

        # 실제로는 10mb 더 준다
        memory_limit += 10240

        # lxc config 생성
        self.generate_config(memory_limit)

        # 모니터를 샌드박스 안에 집어넣는다
        self.put_file(os.path.join(os.path.dirname(__file__), "monitor.py"),
                       "monitor.py")
        cmd = ["python", "monitor.py"]
        if stdin: cmd += ["-i", stdin]
        if stdout: cmd += ["-o", stdout]
        if stderr: cmd += ["-e", stderr]
        cmd += ["-m", str(memory_limit * 1024)]
        if time_limit != None:
            cmd += ["-t", str(int(time_limit + 1.1))]
        cmd.append('"%s"' % command)

        self.create_entrypoint(" ".join(cmd), before, after)
        try:
            result = self._run(True, time_limit)
            if (result["returncode"] != 0 or
                    result["stderr"].strip() or
                    not result["stdout"].strip() or
                    result["stdout"].split()[0] not in ["RTE", "MLE", "OK", "TLE"]):
                error = '(empty stdout)' or result['stdout']
                raise Exception("Unexpected monitor result:\n" + str(result) + "\n" +
                                'cmdline: %s' % (' '.join(cmd)) + '\n' +
                                error)
        except TimeOutException:
            return "TLE"
        print "RESULT", result
        toks = result["stdout"].split()
        if toks[0] == "OK":
            time_used, memory_used = map(float, toks[1:3])
            if time_limit is not None and time_used >= time_limit:
                return (u"TLE (Outside sandbox; time used %d limit %d)" %
                        (time_used, time_limit))
            if memory_used >= memory_limit:
                return (u"MLE (Outside sandbox: memory used %d limit %d)" %
                        (memory_used, memory_limit))

        return result["stdout"]

    def _run(self, redirect, time_limit=None):
        signal.signal(signal.SIGTTOU, signal.SIG_IGN)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        current_path = abspath(dirname(__file__))
        if self.am_i_root:
            return execute(["lxc-execute",
                            "-n", self.name,
                            "-f", self.config,
                            "-o", join(current_path, "lxc.log"),
                            "-l", "INFO",
                            "--",
                            "su", self.user.pw_name, join(self.user.pw_dir, "entrypoint.sh")],
                           redirect=redirect,
                           time_limit=time_limit,
                           kill_command=["lxc-stop",
                                         "-n", self.name])
        return execute(["sh", join(self.home_in_mounted, "entrypoint.sh")],
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
        sandbox = Sandbox("runner", home_type="bind")
        sandbox.put_file('monitor.py', 'monitor.py', 0o700)
        sandbox.run_interactive("bash")
        """
        # sandbox.mount_home("cow")
        # sandbox.run_interactive("bash")
        # sandbox.mount_home("cow")
        # sandbox.run_interactive("bash")
        sandbox = Sandbox("runner", home_type="bind")
        import sys
        for file in sys.argv[1:]:
            sandbox.put_file(file, os.path.basename(file))
        #print sandbox.run("python --version", memory_limit=128*1024, stdout=".stdout", stderr=".stderr")
        sandbox.run_interactive("bash")
        # sandbox.put_file("dp.cpp", "dp.cpp", 0o700)
        # sandbox.put_file("inp", "inp")
        # print sandbox.run("g++ -O3 dp.cpp -o dp", stdout=".compile.stdout",
        #                          stderr=".compile.stderr")
        # print sandbox.run("./dp", "inp", ".stdout", ".stderr")
    finally:
        sandbox.teardown()

if __name__ == "__main__":
    main()
