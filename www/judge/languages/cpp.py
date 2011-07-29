import subprocess

def system(cmd):
    return subprocess.Popen(cmd, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE).communicate()

LANGUAGE = "C++"
EXT = "cpp"
VERSION = system(["g++", "--version"])[0].split("\n")[0]
ADDITIONAL_FILES = []

def setup(sandbox, source_code):
    sandbox.write_file(source_code, "submission.cpp")
    compiled = sandbox.run("g++ -O3 submission.cpp", stdout=".stdout",
                           stderr=".stderr", time_limit=10)
    if compiled.split()[0] != "OK":
        return {"status": "error",
                "message": "\n".join(["MONITOR:", compiled,
                                      "STDOUT:", sandbox.read_file(".stdin"),
                                      "STDERR:", sandbox.read_file(".stderr")])}
    #sandbox.run("rm submission.cpp .stdin .stderr")
    return {"status": "ok"}

def run(sandbox, input_file, time_limit, memory_limit):
    return {"status": "ok"}
