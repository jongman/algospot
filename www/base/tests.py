"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.urls import reverse


class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)


class AccountRouteTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        anonymous_user = User.objects.get(username='AnonymousUser')
        cls.anonymous_setting = override_settings(
            ANONYMOUS_USER_ID=anonymous_user.pk)
        cls.anonymous_setting.enable()

    @classmethod
    def tearDownClass(cls):
        cls.anonymous_setting.disable()
        super().tearDownClass()

    def test_registration_page_uses_the_legacy_site_template(self):
        response = self.client.get(reverse('registration_register'))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(
            response, 'django_registration/registration_form.html')
        self.assertTemplateUsed(response, 'registration/registration_form.html')

    def test_registration_creates_and_logs_in_a_user(self):
        response = self.client.post(reverse('registration_register'), {
            'username': 'new-account-test',
            'email': 'new-account-test@example.com',
            'password1': 'A-strong-test-password-428!',
            'password2': 'A-strong-test-password-428!',
        })

        self.assertRedirects(
            response, reverse('django_registration_complete'),
            fetch_redirect_response=False)
        self.assertTrue(User.objects.filter(
            username='new-account-test').exists())
        self.assertIn('_auth_user_id', self.client.session)
        complete = self.client.get(response.url)
        self.assertEqual(complete.status_code, 200)
        self.assertContains(complete, '회원 가입이 완료되었고 로그인되었습니다.')

    def test_logout_accepts_post_and_redirects_home(self):
        user = User.objects.create_user(
            username='logout-test', password='logout-test-password')
        self.client.force_login(user)
        page = self.client.get(reverse('auth_login'))

        self.assertEqual(page.status_code, 200)
        self.assertContains(page, 'class="logout-form"')
        self.assertContains(page, 'action="/accounts/logout/"')

        response = self.client.post(reverse('auth_logout'))

        self.assertRedirects(response, '/', fetch_redirect_response=False)
        self.assertNotIn('_auth_user_id', self.client.session)
