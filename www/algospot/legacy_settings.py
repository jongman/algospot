# -*- coding: utf-8 -*-
"""Safety overrides for the isolated migration compatibility runtime."""

import os

from algospot.settings import *


DEBUG = True
TEMPLATE_DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'legacy-web']
SECRET_KEY = os.environ['LEGACY_SECRET_KEY']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('LEGACY_POSTGRES_DB', 'algospot_restore'),
        'USER': os.environ['LEGACY_POSTGRES_USER'],
        'PASSWORD': os.environ['LEGACY_POSTGRES_PASSWORD'],
        'HOST': os.environ.get('LEGACY_POSTGRES_HOST', 'postgres'),
        'PORT': os.environ.get('LEGACY_POSTGRES_PORT', '5432'),
        'OPTIONS': {
            'options': '-c default_transaction_read_only=on',
        },
    },
}

# Anonymous characterization requests do not need database-backed sessions.
SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'
EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'
DEFAULT_FROM_EMAIL = 'disabled@localhost.invalid'

MEDIA_ROOT = '/www-media'
MEDIA_URL = '/media/'
STATIC_ROOT = '/tmp/algospot-static'

MIDDLEWARE_CLASSES = tuple(
    middleware for middleware in MIDDLEWARE_CLASSES
    if middleware != 'dogslow.WatchdogMiddleware'
)
DOGSLOW = False
DOGSLOW_LOG_TO_FILE = False

# There is deliberately no worker or broker service. Even if application code
# calls delay(), the in-memory queue cannot leave this process or container.
BROKER_URL = 'memory://'
CELERY_ALWAYS_EAGER = False
CELERY_EAGER_PROPAGATES_EXCEPTIONS = True

HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.whoosh_backend.WhooshEngine',
        'PATH': '/whoosh_index',
        'STORAGE': 'file',
        'POST_LIMIT': 128 * 1024 * 1024,
        'INCLUDE_SPELLING': True,
        'BATCH_SIZE': 10,
    },
}

JUDGE_SETTINGS = dict(JUDGE_SETTINGS)
JUDGE_SETTINGS.update({
    'WORKDIR': '/nonexistent/algospot-judge-disabled',
    'USER': 'nobody',
    'WEBSERVER': 'http://127.0.0.1:9/',
})

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
