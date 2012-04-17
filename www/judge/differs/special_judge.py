# -*- coding: utf-8 -*-
DESC = u"스페셜 저지: 문제에 첨부된 저지 모듈을 이용한 채점 (도움말 참조)"

import imp

def judge(data_dir, input_path, output_path, expected_path):
    try:
        judge_module_info = imp.find_module('judge', [data_dir])
    except ImportError:
        raise Exception("Can't find judge module from attachment.")
    judge_module = imp.load_module('judge', *judge_module_info)
    assert hasattr(judge_module, 'judge'), 'judge.judge() not present'
    return judge_module.judge(input_path, output_path, expected_path)
