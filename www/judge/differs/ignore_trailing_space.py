# -*- coding: utf-8 -*-
DESC = u"줄 끝에 오는 공백 무시"

def judge(data_dir, input_path, output_path, expected_path):
    return ([line.rstrip() for line in open(output_path)] ==
            [line.rstrip() for line in open(expected_path)])

