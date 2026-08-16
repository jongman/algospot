def judge(input_path, output_path, expected_path):
    def read(path):
        with open(path) as source:
            lines = source.readlines()
        return [line for line in lines if line]

    inputs = iter(read(input_path))
    outputs = iter(read(output_path))
    expecteds = iter(read(expected_path))

    def disjoint(first, second):
        return first[1] <= second[0] or second[1] <= first[0]

    cases = int(next(inputs))
    for _ in range(cases):
        meeting_count = int(next(inputs))
        intervals = [
            list(map(int, next(inputs).split()))
            for _ in range(meeting_count)
        ]

        output = next(outputs)
        expected = next(expecteds)
        if output != expected:
            return False
        if output.strip() == 'IMPOSSIBLE':
            continue
        for _ in range(meeting_count):
            next(expecteds)
        picked = [
            list(map(int, next(outputs).split()))
            for _ in range(meeting_count)
        ]
        for index in range(meeting_count):
            if (picked[index] != intervals[index][:2] and
                    picked[index] != intervals[index][2:]):
                return False
            for previous in range(index):
                if not disjoint(picked[index], picked[previous]):
                    return False
    return True


if __name__ == '__main__':
    import sys
    print('YES' if judge(sys.argv[1], sys.argv[2], sys.argv[3]) else 'NO')
