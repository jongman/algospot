from pathlib import Path
from tempfile import TemporaryDirectory

from django.test import SimpleTestCase

from judge.special_checker_ports import (
    alchemy,
    meetingroom,
    meetingroom_legacy,
    packing,
    restore,
    trapcard,
    wordchain,
)


class SpecialCheckerPortTests(SimpleTestCase):
    def run_checker(self, checker, input_data, output_data, expected_data):
        with TemporaryDirectory() as temporary_dir:
            root = Path(temporary_dir)
            paths = []
            for name, contents in (
                    ('input', input_data),
                    ('output', output_data),
                    ('expected', expected_data)):
                path = root / name
                path.write_text(contents, encoding='utf-8')
                paths.append(path)
            return checker.judge(*paths)

    def assert_verdicts(self, checker, input_data, accepted, rejected, expected):
        self.assertTrue(self.run_checker(
            checker, input_data, accepted, expected))
        self.assertFalse(self.run_checker(
            checker, input_data, rejected, expected))

    def test_wordchain(self):
        self.assert_verdicts(
            wordchain, '',
            'dog goat tiger\n', 'dog tiger goat\n', 'dog goat tiger\n')

    def test_alchemy(self):
        self.assert_verdicts(
            alchemy,
            '1\ncase\n1\n2 1 2\n',
            '2 1 2\n',
            '1 1\n',
            'possible\n',
        )

    def test_packing(self):
        self.assert_verdicts(
            packing,
            '1\n1 10\nitem 5 7\n',
            '7 1\nitem\n',
            '6 1\nitem\n',
            '7 1\n',
        )

    def test_packing_smoke_witness(self):
        with TemporaryDirectory() as temporary_dir:
            root = Path(temporary_dir)
            input_path = root / 'packing.in'
            expected_path = root / 'packing.out'
            output_path = root / 'witness.out'
            input_path.write_text(
                '1\n3 10\na 6 8\nb 4 7\nc 5 6\n', encoding='utf-8')
            expected_path.write_text('15 2\n', encoding='utf-8')
            output_path.write_bytes(
                packing.build_smoke_output(input_path, expected_path))
            self.assertTrue(packing.judge(
                input_path, output_path, expected_path))

    def test_meetingroom_legacy(self):
        self.assert_verdicts(
            meetingroom_legacy,
            '1\n1\n1 2 3 4\n',
            'POSSIBLE\n1 2\n',
            'IMPOSSIBLE\n1 2\n',
            'POSSIBLE\n1 2\n',
        )

    def test_restore(self):
        self.assert_verdicts(
            restore,
            '1\n2\nABC\nBCD\n',
            'ABCD\n',
            'ABCE\n',
            'ABCD\n',
        )

    def test_meetingroom(self):
        self.assert_verdicts(
            meetingroom,
            '1\n1\n1 2 3 4\n',
            'POSSIBLE\n1 2\n',
            'IMPOSSIBLE\n1 2\n',
            'POSSIBLE\n1 2\n',
        )

    def test_trapcard(self):
        self.assert_verdicts(
            trapcard,
            '1\n2 2\n..\n..\n',
            '2\n^.\n.^\n',
            '2\n^^\n..\n',
            '2\n^.\n.^\n',
        )
