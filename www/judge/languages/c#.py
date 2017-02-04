# coding=utf-8
import subprocess
from django.conf import settings

def system(cmd):
    return subprocess.Popen(cmd, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE).communicate()

COMPILE_MEMORY_LIMIT = settings.JUDGE_SETTINGS['MINMEMORYSIZE']
LANGUAGE = "C#"
EXT = "c#"
VERSION = ".NET Core %s" % system(["dotnet", "--version"])[0].split("\n")[0]
ADDITIONAL_FILES = []

def setup(sandbox, source_code):
    sandbox.write_file(source_code, "Main.cs")
    compiled = sandbox.run(stdout=".stdout",
                           stderr=".stderr", time_limit=60*60,
                           memory_limit=COMPILE_MEMORY_LIMIT,
                           before=["export NUGET_PACKAGES=/var/runner-nuget-packages",
                                   # provision 단계가 정상적으로 완료됐으면 NUGET_PACKAGES 가 존재해야한다. 그에 대해 설명하는 겸 어설션.
                                   # 준비된 NUGET_PACKAGES 이 없어도 저지는 되나, 컴파일마다 패키지를 매번 다운로드 받아서 메모리를 많이 쓰고 오래걸린다.
                                   # 어설션에 걸리면 sandbox.run 결과를 왜곡시켜서 예외를 발생시킨다.
                                   "[ ! -d $NUGET_PACKAGES ] && echo Ensure /var/runner-nuget-packages is exist. it may not be prepared in the provision step or deleted by accident && exit",
                                   "dotnet new > /dev/null",
                                   "mv Main.cs Program.cs",
                                   "dotnet restore > /dev/null"],
                           command="dotnet build --configuration release")
    if compiled.split()[0] != "OK":
        return {"status": "error", "message": sandbox.read_file(".stderr")}
    return {"status": "ok"}

def run(sandbox, input_file, time_limit, memory_limit):
    result = sandbox.run("dotnet bin/release/netcoreapp1.0/runner.dll",
                         stdin=input_file, time_limit=time_limit,
                         memory_limit=memory_limit,
                         stdout=".stdout", stderr=".stderr")
    toks = result.split()
    if toks[0] != "OK":
        return {"status": "fail", "message": result, "verdict": toks[0] }
    return {"status": "ok", "time": toks[1], "memory": toks[2], "output": ".stdout"}
