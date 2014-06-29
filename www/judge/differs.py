# -*- coding: utf-8 -*-
from os import path

def tokenize(text):
    if isinstance(text, list):
        text = " ".join(text)
    return [x.strip() for x in text.split()]

def ignore_trailing_space(input, output, expected, data_dir, sandbox):
    u"줄 끝에 오는 공백 무시"
    return ([line.rstrip() for line in output] ==
            [line.rstrip() for line in expected])

def ignore_whitespace(input, output, expected, data_dir, sandbox):
    u"공백 무시"
    return tokenize(output.read()) == tokenize(expected.read())

def relative_float(input, output, expected, data_dir, sandbox):
    u"공백 무시: 실수일 경우 1e-8 이하의 오차 허용"
    def cmp_float(output, expected):
        THRESHOLD = 1e-8
        if output == expected: return True
        try:
            out, exp = float(output), float(expected)
        except ValueError:
            return False
        return math.fabs(exp-out) <= THRESHOLD*max(math.fabs(out), 1)

    o = tokenize(output.read())
    e = tokenize(expected.read())
    if len(o) != len(e): return False
    for i in xrange(len(o)):
        if not cmp_float(o[i], e[i]):
            return False
    return True

def strict(input, output, expected, data_dir, sandbox):
    u"엄격하게 (라인 피드 차이 허용)"
    o = [line.rstrip("\r\n") for line in output]
    e = [line.rstrip("\r\n") for line in expected]
    return o == e

def special_judge(input, output, expected, data_dir, sandbox):
    u"스페셜 저지: 문제에 첨부된 채점 모듈을 이용한 채점 (도움말 참조)"
    print 'special_judge entrypoint'
    checker_path = path.join(data_dir, 'checker')
    print 'expected checker', checker_path
    if not path.exists(checker_path):
        raise Exception('Cannot find checker from attachments')
    print 'yay'

    i, o, e = input.read(), output.read(), expected.read()
    input.close()
    output.close()
    expected.close()

    sandbox.mount_home('cow')
    sandbox.write_file(i, '_input')
    sandbox.write_file(o, '_output')
    sandbox.write_file(e, '_expected')
    sandbox.put_file(checker_path, 'checker', permission=0755)

    res = sandbox.run('./checker _input _output _expected', time_limit=10, stdout='_result')
    if res.split()[0] != 'OK':
        raise Exception('checker implementation failed (%s)' % res.strip()) 

    result_path = sandbox.get_file_path('_result')
    if not path.exists(result_path):
        raise Exception('cannot find checker result')

    return open(result_path).read().strip() == 'YES'

if __name__ == '__main__':
    main()
