def disjoint(first, second):
    return first[1] <= second[0] or second[1] <= first[0]


def judge(input_path, output_path, expected_path):
    with open(input_path) as input_file:
        cases = int(input_file.readline())
        with open(output_path) as output_file:
            outputs = output_file.readlines()
        with open(expected_path) as expected_file:
            expecteds = expected_file.readlines()
        if len(outputs) != len(expecteds):
            return False

        output_lines = iter(outputs)
        expected_lines = iter(expecteds)
        for _ in range(cases):
            meeting_count = int(input_file.readline())
            intervals = []
            for _ in range(meeting_count):
                start1, end1, start2, end2 = map(
                    int, input_file.readline().split())
                assert (start1 < end1) and (start2 < end2)
                assert end1 < 43200 and end2 < 43200
                intervals.append(((start1, end1), (start2, end2)))

            possible = next(output_lines)
            if possible != next(expected_lines):
                return False
            # Keep the archived checker's exact behavior, including its newline
            # comparison and first-case return.
            if possible == 'POSSIBLE':
                chosen = []
                for index in range(meeting_count):
                    next(output_lines)
                    times = next(expected_lines).strip().split()
                    if len(times) != 2:
                        return False
                    chosen.append(tuple(map(int, times)))
                    if chosen[-1] not in intervals[index]:
                        return False
                for index in range(meeting_count):
                    for previous in range(index):
                        if not disjoint(chosen[index], chosen[previous]):
                            return False
            return True


if __name__ == '__main__':
    import sys
    print('YES' if judge(sys.argv[1], sys.argv[2], sys.argv[3]) else 'NO')
