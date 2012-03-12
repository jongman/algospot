import subprocess

def system(cmd):
    return subprocess.Popen(cmd, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE).communicate()

LANGUAGE = "Haskell"
EXT = "hs"
VERSION = system(["ghc", "--version"])[0].split("\n")[0]
ADDITIONAL_FILES = []

def setup(sandbox, source_code):
    sandbox.write_file(source_code, "Main.hs")
    compiled = sandbox.run("ghc --make -O2 Main", stdout=".stdout",
                           stderr=".stderr", time_limit=10)
    if compiled.split()[0] != "OK":
        return {"status": "error",
                "message": sandbox.read_file(".stderr")}
    #sandbox.run("rm submission.cpp .stdin .stderr")
    print('haskell setup')
    return {"status": "ok"}

def run(sandbox, input_file, time_limit, memory_limit):
    result = sandbox.run("./Main", stdin=input_file, time_limit=time_limit,
                         override_memory_limit=memory_limit,
                         stdout=".stdout", stderr=".stderr")
    toks = result.split()
    if toks[0] != "OK":
        return {"status": "fail", "message": result, "verdict": toks[0] }
    print('haskell run')
    return {"status": "ok", "time": toks[1], "memory": toks[2], "output": ".stdout"}
