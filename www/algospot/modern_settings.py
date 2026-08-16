"""Local Python 3.13 and Django 5.2 migration runtime."""

import os

from algospot.django111_settings import *
from algospot.toolchain_metadata import JUDGE_LANGUAGE_METADATA


DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'modern-web', 'legacy-web']
SECRET_KEY = os.environ['LEGACY_SECRET_KEY']
DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'
USE_TZ = False

database_name = os.environ.get('LEGACY_POSTGRES_DB', 'algospot_restore')
write_mode = os.environ.get('MODERN_ALLOW_DATABASE_WRITES', '')
allow_scratch_writes = write_mode == 'scratch-only'
allow_controller_writes = (
    write_mode == 'judge-controller'
    and os.environ.get('DJANGO_SETTINGS_MODULE') == 'algospot.judge_settings'
    and os.environ.get('ALGOSPOT_JUDGE_CONTROLLER_ENABLED') == '1'
)
allow_production_writes = (
    write_mode == 'production-web'
    and database_name == 'algospot'
    and os.environ.get('DJANGO_SETTINGS_MODULE') ==
        'algospot.production_settings'
    and os.environ.get('ALGOSPOT_PRODUCTION') == '1'
)
if allow_scratch_writes and database_name != 'algospot_native_migrate':
    raise RuntimeError(
        'Modern database writes are restricted to algospot_native_migrate')
if write_mode not in (
        '', 'scratch-only', 'judge-controller', 'production-web'):
    raise RuntimeError('Unknown MODERN_ALLOW_DATABASE_WRITES mode')
if write_mode == 'judge-controller' and not allow_controller_writes:
    raise RuntimeError(
        'Judge writes require judge_settings and the controller opt-in')
if write_mode == 'production-web' and not allow_production_writes:
    raise RuntimeError(
        'Production writes require production_settings, the algospot '
        'database, and the production opt-in')
allow_database_writes = (
    allow_scratch_writes or allow_controller_writes or
    allow_production_writes
)

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
        } if not allow_database_writes else {}),
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

# These settings are inert in the web process, which has neither the Docker
# socket nor the controller opt-in.  They are shared so the isolated smoke
# command can exercise the same executor without a second settings fork.
JUDGE_CONTAINER_WORK_ROOT = os.environ.get(
    'ALGOSPOT_JUDGE_WORK_ROOT', '/tmp/algospot-judge-work')
JUDGE_CONTAINER_RUNTIME = os.environ.get(
    'ALGOSPOT_JUDGE_RUNTIME', 'runsc')
JUDGE_REQUIRE_IMAGE_DIGESTS = (
    os.environ.get('ALGOSPOT_JUDGE_REQUIRE_IMAGE_DIGESTS', '1') == '1'
)
JUDGE_CHECKER_IMAGE = os.environ.get(
    'ALGOSPOT_JUDGE_CHECKER_IMAGE', 'algospot-judge-checker:local')
JUDGE_REJUDGE_ENABLED = os.environ.get(
    'ALGOSPOT_REJUDGE_ENABLED', '0') == '1'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
}
