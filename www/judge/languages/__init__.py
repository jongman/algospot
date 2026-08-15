# -*- coding: utf-8 -*-
import glob
import os
import importlib
import sys

from django.conf import settings

modules = {}


class LanguageMetadata(object):
    def __init__(self, extension, language, version):
        self.EXT = extension
        self.LANGUAGE = language
        self.VERSION = version


metadata = getattr(settings, 'JUDGE_LANGUAGE_METADATA', ())
if metadata:
    # The web process displays language choices but never executes untrusted
    # submissions. Compiler discovery belongs to the separately isolated
    # judge worker, whose runtime is intentionally absent from this image.
    for extension, language, version in metadata:
        modules[extension] = LanguageMetadata(extension, language, version)
else:
    # 언어별 채점 모듈을 발견해 봅시다
    languages_dir = os.path.dirname(__file__)
    sys.path.append(languages_dir)

    files = glob.glob(os.path.join(languages_dir, "*.py"))
    for file in files:
        try:
            language = os.path.basename(file).split(".")[0]
            if language == "__init__":
                continue
            mod = importlib.import_module(language)
            modules[mod.EXT] = mod
        except Exception as error:
            print('failed to load judge module', file, error)
            continue
    sys.path.remove(languages_dir)
