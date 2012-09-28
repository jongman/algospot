# -*- coding: utf-8 -*-
import glob
import os
import importlib
import sys

modules = {}

# 언어별 채점 모듈을 발견해 봅시다
languages_dir = os.path.dirname(__file__)
sys.path.append(languages_dir)

files = glob.glob(os.path.join(languages_dir, "*.py"))
for file in files:
    try:
        language = os.path.basename(file).split(".")[0]
        if language == "__init__": continue
        mod = importlib.import_module(language)
        modules[mod.EXT] = mod
    except: 
        print 'failed to load judge module', file
        continue
sys.path.remove(languages_dir)
