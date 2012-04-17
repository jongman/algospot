# -*- coding: utf-8 -*-
DESC = u"엄격하게 (라인 피드 차이 허용)"
def tokenize(text):
    if isinstance(text, list):
        text = " ".join(text)
    return [x.strip() for x in text.split()]

def judge(data_dir, input_path, output_path, expected_path):
    o = [line.rstrip("\r\n") for line in open(output_path).readlines()]
    e = [line.rstrip("\r\n") for line in open(expected_path).readlines()]
    return o == e
