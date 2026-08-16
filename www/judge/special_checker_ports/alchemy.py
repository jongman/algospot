def judge(input_path, output_path, expected_path):
    input_file = open(input_path)
    output_file = open(output_path)
    expected_file = open(expected_path)

    read_line = lambda source: source.readline().strip()

    def alchemy(order, recipes):
        ingredients = []
        for item in order:
            ingredients.append(item)
            for index, recipe in reversed(list(enumerate(recipes))):
                if sorted(ingredients) == sorted(recipe):
                    return index + 1
        raise ValueError(
            'something is wrong; the substance was not made, order = {}'.format(
                order))

    def validate():
        cases = int(read_line(input_file))
        for _ in range(cases):
            read_line(input_file)
            item_count = int(read_line(input_file))
            recipes = [[] for _ in range(item_count)]
            for index in range(item_count):
                recipes[index] = list(
                    map(int, read_line(input_file).split()))[1:]

            for index in range(item_count):
                answer = read_line(expected_file)
                user_answer = read_line(output_file)
                if answer == 'IMPOSSIBLE':
                    if user_answer != 'IMPOSSIBLE':
                        raise ValueError(
                            'expected IMPOSSIBLE, but got (%s)' % user_answer)
                else:
                    order = list(map(int, user_answer.split()))
                    order_size, order = order[0], order[1:]
                    if order_size != len(order):
                        raise ValueError(
                            'c_i is wrong : item = {}, expected = {}, got = {}'.format(
                                index + 1, len(order), order_size))
                    if order_size == 0:
                        continue
                    if sorted(recipes[index]) != sorted(order):
                        raise ValueError(
                            'the order is not valid permutation : item={}, '
                            'expected = {}, got = {}'.format(
                                index + 1, recipes[index], order))
                    made = alchemy(order, recipes)
                    if made != index + 1:
                        raise ValueError(
                            'the substance made was {} but expected {} : got = {}'.format(
                                made, index + 1, order))

            try:
                read_line(output_file)
            except Exception:
                pass
            try:
                read_line(expected_file)
            except Exception:
                pass

    try:
        validate()
        return True
    except Exception:
        return False
    finally:
        input_file.close()
        output_file.close()
        expected_file.close()


if __name__ == '__main__':
    import sys
    print('YES' if judge(sys.argv[1], sys.argv[2], sys.argv[3]) else 'NO')
