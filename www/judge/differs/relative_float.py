# -*- coding: utf-8 -*-
import math
DESC = u"공백 무시: 실수일 경우 1e-8 이하의 오차 허용"

def tokenize(text):
    if isinstance(text, list):
        text = " ".join(text)
    return [x.strip() for x in text.split()]

def cmp_float(output, expected):
    THRESHOLD = 1e-8
    if output == expected: return True
    try:
        out, exp = float(output), float(expected)
    except ValueError:
        return False
    return math.fabs(exp-out) <= THRESHOLD*max(math.fabs(out), 1)

def judge(input_path, output_path, expected_path):
    o, e = tokenize(open(output_path).read()), tokenize(open(expected_path).read())
    if len(o) != len(e): return False
    for i in xrange(len(o)):
        if not cmp_float(o[i], e[i]):
            return False
    return True
