# -*- coding: utf-8 -*-
import subprocess
from django.conf import settings

def system(cmd):
    return subprocess.Popen(cmd, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE).communicate()

COMPILE_MEMORY_LIMIT = settings.JUDGE_SETTINGS['MINMEMORYSIZE']
LANGUAGE = "Java"
EXT = "java"
VERSION = system(["java", "-version"])[1].split()[2].strip('"')
ADDITIONAL_FILES = []

def setup(sandbox, source_code):
    sandbox.write_file(source_code, "Main.java")
    compiled = sandbox.run("javac Main.java", stdout=".stdout",
                           stderr=".stderr", time_limit=10,
                           memory_limit=COMPILE_MEMORY_LIMIT)
    if compiled.split()[0] != "OK":
        return {"status": "error",
                "message": ("MONITOR:\n" + compiled + "\n" +
                            "STDERR:\n" + sandbox.read_file(".stderr") + "\n" +
                            "STDOUT:\n" + sandbox.read_file(".stdout"))}
    return {"status": "ok"}

def run(sandbox, input_file, time_limit, memory_limit):
    # 크기를 예측하기 어려윤 JVM의 non-heap 메모리 영역을 확보해 주기 위해 sandbox 의 메모리 제한을 충분히 크게 할당한다.
    # 문제의 메모리 제한 조건은 java 의 -Xmx 옵션으로 heap 영역에만 적용되는 셈인데, 충분히 납득할 만 하다고 본다.
    max_non_heap_size = 65536
    result = sandbox.run("java -Xmx%dK -Xms%dK Main" % (memory_limit, memory_limit),
                         stdin=input_file, time_limit=time_limit,
                         memory_limit=memory_limit + max_non_heap_size,
                         stdout=".stdout", stderr=".stderr")
    toks = result.split()
    if toks[0] != "OK":
        return {"status": "fail", "message": result, "verdict": toks[0] }
    return {"status": "ok", "time": toks[1], "memory": toks[2], "output": ".stdout"}
