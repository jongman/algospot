# -*- coding: utf-8 -*-
# Django settings for algospot project.

import os, sys
from datetime import datetime

PROJECT_DIR = os.path.dirname(__file__)
j = lambda filename: os.path.join(PROJECT_DIR, filename)
sys.path.append(j("libs/common"))
sys.path.append(j("libs/external"))

DEBUG = False
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('JongMan Koo', 'jongman@gmail.com'),
    ('Wonha Ryu', 'wonha.ryu@gmail.com'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        # TODO: change this into an absolute path if you're running celeryd from
        # a separate checkout in the same machine
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'db.sqlite3',                      # Or path to database file if using sqlite3.
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Asia/Seoul'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = j("../media")

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
#MEDIA_URL = '/media/'
# set for development: reset for prod
MEDIA_URL = "http://0.0.0.0:8000/media/"

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = j("../www_static")

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# URL prefix for admin static files -- CSS, JavaScript and images.
# Make sure to use a trailing slash.
# Examples: "http://foo.com/static/admin/", "/static/admin/".
ADMIN_MEDIA_PREFIX = '/static/admin/'

# Additional locations of static files
STATICFILES_DIRS = (
    j("../static"),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    #    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'ql^5l!arg8ua-nxp-n+!*a-n%9_^osj-*k7ae@zu=n$zbrod-w'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    #     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'algospot.urls'

TEMPLATE_DIRS = (
    j("../templates"),
)

INTERNAL_IPS = ('127.0.0.1',)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.comments',

    'south',
    'django_extensions',
    'registration',
    'avatar',
    'djcelery',
    'tagging',
    'haystack',
    'guardian',
    #'actstream',

    'base',
    'wiki',
    'forum',
    'newsfeed',
    'judge',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)

AUTH_PROFILE_MODULE = 'base.UserProfile'

ACCOUNT_ACTIVATION_DAYS = 7

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

# this is a dev setting
EMAIL_HOST = 'localhost'
EMAIL_PORT = 25

# avatar setting

AUTO_GENERATE_AVATAR_SIZES = (45, 80, 120)
AVATAR_STORAGE_DIR = "avatars"
AVATAR_GRAVATAR_BACKUP = False
AVATAR_DEFAULT_URL = "/static/images/unknown-user.png"

LOGIN_REDIRECT_URL = "/"

DEBUG_TOOLBAR_CONFIG = {"INTERCEPT_REDIRECTS": False }

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.contrib.messages.context_processors.messages",
    'django.core.context_processors.request',
    "forum.processors.add_categories",
    'base.processors.select_campaign'
)

AUTHENTICATION_BACKENDS = (
    'base.backends.LegacyBackend',
    'base.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
)

# GUARDIAN SETTINGS
ANONYMOUS_USER_ID = -1
GUARDIAN_RAISE_403 = True

# JUDGE SETTINGS
JUDGE_SETTINGS = {
    "WORKDIR": j("../judge/work"),
    "USER": "runner",
    "FILESYSTEMSIZE": 64 * 1024,
    "MINMEMORYSIZE": 256 * 1024,
}

# PAGINATION SETTINGS
ITEMS_PER_PAGE = 20
PAGINATOR_RANGE = 5

# PROFILE SETTINGS
PROFILE_LOG_BASE = None

# CELERY SETTINGS
import djcelery
djcelery.setup_loader()

CELERY_IMPORTS = ("judge.tasks",)
CELERYD_CONCURRENCY = 1

# haystack
HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.whoosh_backend.WhooshEngine',
        'PATH': j('../whoosh_index'),
        'STORAGE': 'file',
        'POST_LIMIT': 128 * 1024 * 1024,
        'INCLUDE_SPELLING': True,
        'BATCH_SIZE': 10
    }
}

USE_AYAH = False

SOLVED_CAMPAIGN = [
    {'problem': 'HELLOWORLD',
     'begin': datetime(2012, 1, 1, 0, 0, 0),
     'end': datetime(2012, 12, 31, 23, 59, 59),
     'message': u"""*HELLO WORLD 문제를 푸셨군요!*

축하합니다! ^^
     """.strip()},
]

try:
    import local_settings
except ImportError:
    pass
