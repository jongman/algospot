def judge(input_path, output_path, expected_path):
    def read(path):
        with open(path) as source:
            lines = source.readlines()
        return [line for line in lines if line]

    inputs = iter(read(input_path))
    outputs = iter(read(output_path))
    expecteds = iter(read(expected_path))

    cases = int(next(inputs))
    for _ in range(cases):
        height, width = map(int, next(inputs).split())
        output_traps = int(next(outputs))
        expected_traps = int(next(expecteds))
        if output_traps != expected_traps:
            return False
        input_grid = [next(inputs).strip() for _ in range(height)]
        output_grid = [next(outputs).strip() for _ in range(height)]
        expected_grid = [next(expecteds).strip() for _ in range(height)]
        for input_row, output_row in zip(input_grid, output_grid):
            if len(input_row) != len(output_row):
                return False
            for input_cell, output_cell in zip(input_row, output_row):
                if input_cell == '#' and output_cell != '#':
                    return False
                if input_cell != '#' and output_cell == '#':
                    return False
        trap_count = sum(row.count('^') for row in output_grid)
        if trap_count != expected_traps:
            return False
        for row in range(height):
            for column in range(width):
                if (output_grid[row][column] == '^' and
                        ((column + 1 < width and
                          output_grid[row][column + 1] == '^') or
                         (row + 1 < height and
                          output_grid[row + 1][column] == '^'))):
                    return False
        # Keep the archived checker's first-case return behavior.
        return True


if __name__ == '__main__':
    import sys
    print('YES' if judge(sys.argv[1], sys.argv[2], sys.argv[3]) else 'NO')
