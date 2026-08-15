"""Local Python 3.13 and Django 5.2 migration runtime."""

import os

from algospot.django111_settings import *


DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'modern-web', 'legacy-web']
SECRET_KEY = os.environ['LEGACY_SECRET_KEY']
DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'
USE_TZ = False

database_name = os.environ.get('LEGACY_POSTGRES_DB', 'algospot_restore')
allow_scratch_writes = (
    os.environ.get('MODERN_ALLOW_DATABASE_WRITES') == 'scratch-only'
)
if allow_scratch_writes and database_name != 'algospot_native_migrate':
    raise RuntimeError(
        'Modern database writes are restricted to algospot_native_migrate')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': database_name,
        'USER': os.environ['LEGACY_POSTGRES_USER'],
        'PASSWORD': os.environ['LEGACY_POSTGRES_PASSWORD'],
        'HOST': os.environ.get('LEGACY_POSTGRES_HOST', 'postgres'),
        'PORT': os.environ.get('LEGACY_POSTGRES_PORT', '5432'),
        'OPTIONS': ({
            'options': '-c default_transaction_read_only=on',
        } if not allow_scratch_writes else {}),
    },
}

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'algospot.comments_app.LegacyCommentsConfig',
    'django_registration',
    'avatar',
    'tagging',
    'haystack',
    'guardian',
    'base',
    'wiki',
    'forum',
    'newsfeed',
    'judge',
)

MIDDLEWARE = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'base.middlewares.ActiveUserMiddleware',
)
MIDDLEWARE_CLASSES = ()

COMMENTS_URLCONF = 'django_comments.urls'
MIGRATION_MODULES = {
    'comments': 'algospot.comments_migrations',
}

SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'
EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'
DEFAULT_FROM_EMAIL = 'disabled@localhost.invalid'

MEDIA_ROOT = '/www-media'
MEDIA_URL = '/media/'
STATIC_ROOT = '/tmp/algospot-static'

# Restored uploads are immutable migration evidence. The modern avatar package
# normally creates thumbnails on first read, so use original stored images and
# fall back to its packaged default without writing into MEDIA_ROOT.
AVATAR_PROVIDERS = (
    'algospot.avatar_provider.LegacyReadOnlyAvatarProvider',
    'avatar.providers.DefaultAvatarProvider',
)

HAYSTACK_CONNECTIONS = {
    'default': {
        # The archived Whoosh index contains Python 2 pickles and is retained
        # only as rescue evidence. The maintained in-process backend keeps
        # local search functional without deserializing unsafe legacy state.
        'ENGINE': 'haystack.backends.simple_backend.SimpleEngine',
    },
}

JUDGE_SETTINGS = dict(JUDGE_SETTINGS)
JUDGE_SETTINGS.update({
    'WORKDIR': '/nonexistent/algospot-judge-disabled',
    'USER': 'nobody',
    'WEBSERVER': 'http://127.0.0.1:9/',
})

JUDGE_LANGUAGE_METADATA = (
    ('cpp', 'C++', 'isolated judge worker'),
    ('java', 'Java', 'isolated judge worker'),
    ('c', 'C11', 'isolated judge worker'),
    ('py3', 'Python 3', 'isolated judge worker'),
    ('py', 'Python 2 (legacy)', 'isolated judge worker'),
    ('pypy', 'Python 2 / PyPy (legacy)', 'isolated judge worker'),
    ('js', 'JavaScript / Node', 'isolated judge worker'),
    ('go', 'Go', 'isolated judge worker'),
    ('rb', 'Ruby', 'isolated judge worker'),
    ('scala', 'Scala', 'isolated judge worker'),
    ('hs', 'Haskell', 'isolated judge worker'),
    ('rs', 'Rust', 'isolated judge worker'),
    ('lua', 'LuaJIT', 'isolated judge worker'),
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
}
