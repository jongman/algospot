# -*- coding: utf-8 -*-
from django.conf import settings
from algospot import celery_app as app
from celery.utils.log import get_task_logger
from models import Submission, Attachment
import hashlib
import urllib
import shutil
import os
import zipfile
import glob
import sandbox
import languages
import StringIO
import traceback
import differs

def print_stack_trace():
    io = StringIO.StringIO()
    traceback.print_exc(file=io)
    io.seek(0)
    return io.read()
   
logger = get_task_logger(__name__)

@app.task()
def judge_submission(submission):

    def copy(source, dest):
        while True:
            chunk = source.read(1024*1024)
            if not chunk: break
            dest.write(chunk)

    def download(attachment, destination):
        # TODO: add MD5 verification to downloaded files
        url = settings.JUDGE_SETTINGS['WEBSERVER'] + attachment.file.url
        logger.info("downloading %s ..", url)
        copy(urllib.urlopen(url), open(destination, "wb"))

    def unzip_and_sanitize(archive, data_dir):
        logger.info("unzipping %s ..", archive)
        file = zipfile.ZipFile(archive, "r")
        for name in file.namelist():
            dest = os.path.join(data_dir, os.path.basename(name))
            logger.info("generating %s ..", dest)
            copy(file.open(name), open(dest, "wb"))
            sanitize_data(dest)

    def download_data(problem):
        attachments = Attachment.objects.filter(problem=problem)
        """
            There are three cases: created, modified, removed.
            I am too lazy to handle all these cases optimally,
            so I'm going to evaluate the hash of all those paths,
            and compare them to re-download all or do nothing.
        """
        entries_to_download = []
        for entry in attachments:
            basename = os.path.basename(entry.file.name)
            ext = basename.split(".")[-1].lower()
            if basename != 'checker' and ext not in ["in", "out", "zip"]: continue
            entries_to_download.append((entry, basename))

        joined_entries = "@".join(map(lambda x: x[0].file.name, entries_to_download))
        md5 = hashlib.md5(joined_entries).hexdigest()
        pathhash_name = md5 + '.pathhash'
        pathhash_path = os.path.join(data_dir, pathhash_name)
        if os.path.exists(data_dir) and os.path.exists(pathhash_name):
            return

        if os.path.exists(data_dir):
            shutil.rmtree(data_dir)
        os.makedirs(data_dir)

        for pair in entries_to_download:
            entry, basename = pair
            ext = basename.split(".")[-1].lower()
            destination = os.path.join(data_dir, basename)
            download(entry, destination)
            if ext == "zip":
                unzip_and_sanitize(destination, data_dir)
            else:
                sanitize_data(destination)
        
        open(pathhash_path, 'w').close()

    def sanitize_data(filename):
        # line endings: DOS -> UNIX
        file = open(filename, 'r+b')
        body = file.read().replace('\r\n', '\n')
        file.seek(0)
        file.write(body)
        file.truncate()
        file.close()

    def get_ioset():
        io = {}
        for file in glob.glob(os.path.join(data_dir, "*")):
            if file.endswith(".in") or file.endswith(".out"):
                tokens = file.split(".")
                basename = ".".join(tokens[:-1])
                if basename not in io:
                    io[basename] = {}
                io[basename][tokens[-1]] = file
        if not io:
            raise Exception("Judge I/O data not found.")
        for key, value in io.iteritems():
            if len(value) != 2:
                raise Exception("Non-matching pairs in judge I/O data. See: %s"
                                % str(io))
        return io

    sandbox_env = None
    try:
        logger.info("Checking language module..")
        # 언어별 채점 모듈 존재 여부부터 확인하기
        if submission.language not in languages.modules:
            raise Exception("Can't find judge module for language %s" %
                            submission.language)
        language_module = languages.modules[submission.language]

        problem = submission.problem

        # 결과 differ 모듈 확인
        if not hasattr(differs, problem.judge_module):
            raise Exception("Can't find diff module %s" % problem.judge_module)
        differ = getattr(differs, problem.judge_module)

        # 문제 채점 데이터를 다운받고 채점 준비
        logger.info("Downloading judge i/o set..")
        data_dir = os.path.join(settings.JUDGE_SETTINGS["WORKDIR"],
                                "data/%d-%s" % (problem.id, problem.slug))
        download_data(submission.problem)
        ioset = get_ioset()

        logger.info("Initiating sandbox..")
        sandbox_env = sandbox.get_sandbox()

        logger.info("Compiling..")
        # 컴파일
        submission.state = Submission.COMPILING
        submission.save()
        result = language_module.setup(sandbox_env, submission.source)
        if result["status"] != "ok":
            submission.state = Submission.COMPILE_ERROR
            submission.message = result["message"]
            return

        logger.info("Freezing sandbox..")
        # set sandbox in copy-on-write mode: will run
        sandbox_env.mount_home("cow")

        # let's run now
        logger.info("Running..")
        submission.state = Submission.RUNNING
        submission.save()
        total_time, max_memory = 0, 64
        for io in ioset.itervalues():
            inp = os.path.basename(io["in"])
            sandbox_env.put_file(io["in"], inp)
            result = language_module.run(sandbox_env, inp,
                                         problem.last_revision.time_limit / 1000.,
                                         problem.last_revision.memory_limit)

            # RTE 혹은 MLE?
            if result["status"] != "ok":
                if result["verdict"] == "TLE":
                    submission.state = Submission.TIME_LIMIT_EXCEEDED
                elif result["verdict"] == "MLE":
                    submission.state = Submission.RUNTIME_ERROR
                    submission.message = '\n'.join([u"메모리 제한 초과",
                                                    result["message"]])
                elif result["verdict"] == "RTE":
                    submission.state = Submission.RUNTIME_ERROR
                    submission.message = result["message"]
                return

            # 전체 시간이 시간 초과면 곧장 TLE
            # TODO: 채점 데이터별 시간 제한 지원
            total_time += float(result["time"])
            max_memory = max(max_memory, int(result["memory"]))
            if total_time > problem.last_revision.time_limit / 1000.:
                submission.state = Submission.TIME_LIMIT_EXCEEDED
                return

            # differ 에 보내자
            output = sandbox_env.get_file_path(result["output"])
            if not differ(open(io["in"]), open(output), open(io["out"]),
                          data_dir, sandbox_env):
                submission.time = int(total_time * 1000)
                submission.memory = max_memory
                submission.state = Submission.WRONG_ANSWER
                return

        submission.time = int(total_time * 1000)
        submission.memory = max_memory
        submission.state = Submission.ACCEPTED

    except Exception as e1:
        submission.state = Submission.CANT_BE_JUDGED
        try:
            print e1.message
            print print_stack_trace()
            submission.message = u"\n".join([
                u"채점 중 예외가 발생했습니다.",
                u"익셉션: %s" % e1.message,
                u"스택 트레이스:",
                print_stack_trace()])
        except Exception as e2:
            submission.message = u"오류 인코딩 중 에러: %s" % e2.message
    finally:
        submission.save()
        if sandbox_env: sandbox_env.teardown()


