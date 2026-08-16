def judge(input_path, output_path, expected_path):
    def read(path):
        with open(path) as source:
            lines = source.readlines()
        return [line for line in lines if line]

    try:
        inputs = iter(read(input_path))
        outputs = iter(read(output_path))
        expecteds = iter(read(expected_path))

        cases = int(next(inputs))
        for _ in range(cases):
            item_count, capacity = map(int, next(inputs).split())
            info = {}
            for _ in range(item_count):
                name, volume, need = next(inputs).split()
                info[name] = (int(volume), int(need))

            max_need, _ = map(int, next(expecteds).split())
            need, picked_count = map(int, next(outputs).split())
            if max_need != need:
                return False

            names = [next(outputs).strip() for _ in range(picked_count)]
            if len(names) != len(set(names)):
                return False
            total_need = 0
            total_volume = 0
            for name in names:
                if name not in info:
                    return False
                volume, item_need = info[name]
                total_volume += volume
                total_need += item_need
            if total_volume > capacity:
                return False
            if total_need != max_need:
                return False
        return True
    except Exception:
        return False


def build_smoke_output(input_path, expected_path):
    """Build a valid witness for archived outputs that store only objectives."""
    with open(input_path) as input_file, open(expected_path) as expected_file:
        cases = int(input_file.readline())
        output_lines = []
        for _ in range(cases):
            item_count, capacity = map(int, input_file.readline().split())
            items = []
            for _ in range(item_count):
                name, volume, need = input_file.readline().split()
                items.append((name, int(volume), int(need)))

            expected_need, _ = map(int, expected_file.readline().split())
            best_need = [-1] * (capacity + 1)
            best_items = [None] * (capacity + 1)
            best_need[0] = 0
            best_items[0] = ()
            for name, volume, need in items:
                for used in range(capacity - volume, -1, -1):
                    if best_items[used] is None:
                        continue
                    candidate_volume = used + volume
                    candidate_need = best_need[used] + need
                    if candidate_need > best_need[candidate_volume]:
                        best_need[candidate_volume] = candidate_need
                        best_items[candidate_volume] = best_items[used] + (name,)

            optimal_volume = max(
                range(capacity + 1), key=lambda volume: best_need[volume])
            if best_need[optimal_volume] != expected_need:
                raise ValueError(
                    'Archived PACKING objective does not match the input')
            picked = best_items[optimal_volume]
            output_lines.append('%s %s' % (expected_need, len(picked)))
            output_lines.extend(picked)
    return ('\n'.join(output_lines) + '\n').encode('utf-8')


if __name__ == '__main__':
    import sys
    print('YES' if judge(sys.argv[1], sys.argv[2], sys.argv[3]) else 'NO')
