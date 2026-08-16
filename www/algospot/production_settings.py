"""Fail-closed settings for the writable containerized production site."""

import os

from algospot.modern_settings import *


def csv_environment(name, default=''):
    return [item.strip() for item in os.environ.get(name, default).split(',')
            if item.strip()]


if os.environ.get('ALGOSPOT_PRODUCTION') != '1':
    raise RuntimeError('Production settings require ALGOSPOT_PRODUCTION=1')
if os.environ.get('MODERN_ALLOW_DATABASE_WRITES') != 'production-web':
    raise RuntimeError('The production web process requires write access')
if DATABASES['default']['NAME'] != 'algospot':
    raise RuntimeError('Production settings require the algospot database')

DEBUG = False
MIDDLEWARE = (
    'django.middleware.security.SecurityMiddleware',
) + MIDDLEWARE + (
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)
ALLOWED_HOSTS = csv_environment(
    'ALGOSPOT_ALLOWED_HOSTS', 'algospot.com,www.algospot.com')
CSRF_TRUSTED_ORIGINS = csv_environment(
    'ALGOSPOT_CSRF_TRUSTED_ORIGINS',
    'https://algospot.com,https://www.algospot.com')

SECRET_KEY = os.environ['ALGOSPOT_SECRET_KEY']
MEDIA_ROOT = os.environ.get('ALGOSPOT_MEDIA_ROOT', '/data/media')
STATIC_ROOT = os.environ.get('ALGOSPOT_STATIC_ROOT', '/data/static')

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = os.environ.get(
    'ALGOSPOT_SECURE_SSL_REDIRECT', '1') == '1'
SESSION_COOKIE_SECURE = os.environ.get(
    'ALGOSPOT_SESSION_COOKIE_SECURE', '1') == '1'
CSRF_COOKIE_SECURE = os.environ.get(
    'ALGOSPOT_CSRF_COOKIE_SECURE', '1') == '1'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
SECURE_HSTS_SECONDS = int(os.environ.get('ALGOSPOT_SECURE_HSTS_SECONDS', '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = SECURE_HSTS_SECONDS > 0
X_FRAME_OPTIONS = 'DENY'

EMAIL_BACKEND = os.environ.get(
    'ALGOSPOT_EMAIL_BACKEND',
    'django.core.mail.backends.dummy.EmailBackend')
DEFAULT_FROM_EMAIL = os.environ.get(
    'ALGOSPOT_DEFAULT_FROM_EMAIL', 'noreply@algospot.com')
SERVER_EMAIL = os.environ.get('ALGOSPOT_SERVER_EMAIL', DEFAULT_FROM_EMAIL)

if EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend':
    def required_email_setting(name):
        value = os.environ.get(name, '')
        if not value:
            raise RuntimeError('SMTP email requires %s' % name)
        return value

    EMAIL_HOST = required_email_setting('ALGOSPOT_EMAIL_HOST')
    EMAIL_PORT = int(os.environ.get('ALGOSPOT_EMAIL_PORT', '587'))
    EMAIL_HOST_USER = required_email_setting('ALGOSPOT_EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = required_email_setting(
        'ALGOSPOT_EMAIL_HOST_PASSWORD')
    EMAIL_USE_TLS = os.environ.get('ALGOSPOT_EMAIL_USE_TLS', '1') == '1'
    EMAIL_USE_SSL = os.environ.get('ALGOSPOT_EMAIL_USE_SSL', '0') == '1'
    EMAIL_TIMEOUT = int(os.environ.get('ALGOSPOT_EMAIL_TIMEOUT', '10'))
    if EMAIL_USE_TLS and EMAIL_USE_SSL:
        raise RuntimeError('SMTP TLS and implicit SSL cannot both be enabled')
