from django.conf import settings
from celery.decorators import task
from models import Attachment
import urllib
import urlparse
import os
import zipfile

@task()
def add(x, y):
    return x + y

@task()
def judge_submission(server, submission):
    logger = judge_submission.get_logger()

    def copy(source, dest):
        while True:
            chunk = source.read(1024*1024)
            if not chunk: break
            dest.write(chunk)

    def download(server, attachment, destination):
        # TODO: add MD5 verification to downloaded files
        full = urlparse.urljoin(server, attachment.file.url)
        logger.info("downloading %s ..", server)
        copy(urllib.urlopen(full), open(destination, "wb"))

    def unzip(archive, data_dir):
        logger.info("unzipping %s ..", archive)
        file = zipfile.ZipFile(archive, "r")
        for name in file.namelist():
            dest = os.path.join(data_dir, os.path.basename(name))
            logger.info("generating %s ..", dest)
            copy(file.open(name), open(dest, "wb"))

    def download_data(server, problem):
        attachments = Attachment.objects.filter(problem=problem)
        data_dir = os.path.join(settings.JUDGE_WORKDIR, "data/%d-%s" % (problem.id,
                                                                        problem.slug))
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        for entry in attachments:
            basename = os.path.basename(entry.file.name)
            ext = basename.split(".")[-1].lower()
            if ext not in ["in", "out", "zip"]: continue
            destination = os.path.join(data_dir, basename)
            # TODO: check MD5 and make sure we don't have to download again
            if not os.path.exists(destination):
                download(server, entry, destination)
                if ext == "zip":
                    unzip(destination, data_dir)
            else:
                logger.info("We already have %s", basename)

    download_data(server, submission.problem)
