"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import SimpleTestCase, TestCase

from judge.views.problem import get_problem_list_order


class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)


class ProblemListOrderingTests(SimpleTestCase):
    def test_supported_orderings_are_preserved(self):
        for field in ('slug', 'name', 'user', 'submissions_count', 'ratio'):
            with self.subTest(field=field):
                self.assertEqual(get_problem_list_order(field), field)
                self.assertEqual(get_problem_list_order('-' + field),
                                 '-' + field)

    def test_malformed_or_unsupported_ordering_uses_default(self):
        for value in (
                '-slugverdict=notyetuser_tried=33535',
                'accepted_count', 'user__password', '--slug', ''):
            with self.subTest(value=value):
                self.assertEqual(get_problem_list_order(value), 'slug')
