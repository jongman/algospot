# -*- coding: utf-8 -*-
import glob
import os
import importlib
import sys

modules = {}

# 출력 결과 비교 모듈을 발견해 봅시다
diff_dir = os.path.dirname(__file__)
sys.path.append(diff_dir)

files = glob.glob(os.path.join(diff_dir, "*.py"))
for file in files:
    try:
        differ = os.path.basename(file).split(".")[0]
        if differ == "__init__": continue
        mod = importlib.import_module(differ)
        if hasattr(mod, "judge"):
            modules[differ] = mod
    except ImportError:
        continue

sys.path.remove(diff_dir)
