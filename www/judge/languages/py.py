import subprocess

def system(cmd):
    return subprocess.Popen(cmd, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE).communicate()

LANGUAGE = "Python 2"
EXT = "py"
VERSION = system(["python", "--version"])[1].split("\n")[0]
ADDITIONAL_FILES = []

def setup(sandbox, source_code):
    sandbox.write_file(source_code, "submission.py")
    return {"status": "ok"}

def run(sandbox, input_file, time_limit):
    result = sandbox.run("python submission.py", stdin=input_file, time_limit=time_limit,
                         stdout=".stdout", stderr=".stderr")
    toks = result.split()
    if toks[0] != "OK":
        return {"status": "fail", "message": result, "verdict": toks[0] }
    return {"status": "ok", "time": toks[1], "memory": toks[2], "output": ".stdout"}
