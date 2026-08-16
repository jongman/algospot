def judge(input_path, output_path, expected_path):
    def read(path):
        with open(path) as source:
            return source.read().strip().splitlines()

    try:
        inputs = iter(read(input_path))
        output_lines = read(output_path)
        outputs = iter(output_lines)
        expecteds = iter(read(expected_path))

        cases = int(next(inputs))
        if len(output_lines) != cases:
            return False
        for _ in range(cases):
            chunk_count = int(next(inputs))
            chunks = [next(inputs) for _ in range(chunk_count)]
            output = next(outputs)
            expected = next(expecteds)
            if len(output) != len(expected):
                return False
            for chunk in chunks:
                if chunk not in output:
                    return False
        return True
    except Exception:
        return False


if __name__ == '__main__':
    import sys
    print('YES' if judge(sys.argv[1], sys.argv[2], sys.argv[3]) else 'NO')
