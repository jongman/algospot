import subprocess

def system(cmd):
    return subprocess.Popen(cmd, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE).communicate()

LANGUAGE = "C++"
EXT = "cpp"
VERSION = system(["g++", "--version"])[0].split("\n")[0]
ADDITIONAL_FILES = []

def setup(sandbox, source_code):
    return {"status": "ok"}

def run(sandbox, input_file, time_limit, memory_limit):
    return {"status": "ok"}
