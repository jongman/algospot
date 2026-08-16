def judge(input_path, output_path, expected_path):
    def read(path):
        with open(path) as source:
            lines = source.readlines()
        return [line for line in lines if line]

    outputs = read(output_path)
    expecteds = read(expected_path)
    if len(outputs) != len(expecteds):
        return False

    for output, expected in zip(outputs, expecteds):
        words = output.strip().split()
        expected_words = expected.strip().split()
        if set(words) != set(expected_words):
            return False
        for first, second in zip(words, words[1:]):
            if first[-1] != second[0]:
                return False
    return True


if __name__ == '__main__':
    import sys
    print('YES' if judge(sys.argv[1], sys.argv[2], sys.argv[3]) else 'NO')
