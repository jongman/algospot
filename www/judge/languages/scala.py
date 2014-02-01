import subprocess

def system(cmd):
    return subprocess.Popen(cmd, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE).communicate()

LANGUAGE = "Scala"
EXT = "scala"
VERSION = system(["scala", "-version"])[0].split("\n")[0]
ADDITIONAL_FILES = []

def setup(sandbox, source_code):
    sandbox.write_file(source_code, "Main.scala")
    compiled = sandbox.run("scalac -optimise Main.scala", stdout=".stdout",
                           stderr=".stderr", time_limit=10)
    if compiled.split()[0] != "OK":
        return {"status": "error",
                "message": ("MONITOR:\n" + compiled + "\n" +
                            "STDERR:\n" + sandbox.read_file(".stderr") + "\n" +
                            "STDOUT:\n" + sandbox.read_file(".stdout"))}
    return {"status": "ok"}

def run(sandbox, input_file, time_limit, memory_limit):
    result = sandbox.run("scala Main", stdin=input_file, time_limit=time_limit,
                         override_memory_limit=memory_limit,
                         stdout=".stdout", stderr=".stderr")
    toks = result.split()
    if toks[0] != "OK":
        return {"status": "fail", "message": result, "verdict": toks[0] }
    return {"status": "ok", "time": toks[1], "memory": toks[2], "output": ".stdout"}
