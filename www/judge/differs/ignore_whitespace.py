# -*- coding: utf-8 -*-
DESC = u"공백 무시"
def tokenize(text):
    if isinstance(text, list):
        text = " ".join(text)
    return [x.strip() for x in text.split()]

def judge(data_dir, input_path, output_path, expected_path):
    return (tokenize(open(output_path).read()) ==
            tokenize(open(expected_path).read()))
