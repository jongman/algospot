from django.test import SimpleTestCase

from judge.container_data import JudgeDataError, compare_output


class ContainerComparisonTests(SimpleTestCase):
    def test_whitespace_comparison(self):
        self.assertTrue(compare_output(
            'ignore_whitespace', b'1  2\n3', b'1\n2 3\n'))
        self.assertFalse(compare_output(
            'ignore_whitespace', b'1 2 4', b'1 2 3'))

    def test_strict_comparison_allows_line_ending_difference(self):
        self.assertTrue(compare_output('strict', b'a\r\nb\n', b'a\nb\n'))
        self.assertFalse(compare_output('strict', b'a b\n', b'a  b\n'))

    def test_relative_float_rejects_non_finite_output(self):
        self.assertFalse(compare_output('relative_float', b'nan', b'1.0'))
        self.assertFalse(compare_output('relative_float', b'inf', b'1.0'))
        self.assertTrue(compare_output(
            'relative_float', b'1.000000001', b'1.0'))

    def test_unknown_comparer_fails_closed(self):
        for kind in ('', 'not_registered'):
            with self.assertRaises(JudgeDataError):
                compare_output(kind, b'', b'')
