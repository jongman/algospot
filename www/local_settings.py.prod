# -*- coding: utf-8 -*-

import settings
import sys
sys.path.append('/home/algospot/algospot')
sys.path.append('/home/algospot/algospot/www')

USE_TOOLBAR = False
USE_PROFILING = False
# USE_TOOLBAR = True

# Use a local mysql database
settings.DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'algospot',
        'USER': 'algospot',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}

# Use django debug toolbar
if USE_TOOLBAR:
    settings.MIDDLEWARE_CLASSES += ('debug_toolbar.middleware.DebugToolbarMiddleware',)
    settings.INSTALLED_APPS += ('debug_toolbar',)

if USE_PROFILING:
    settings.PROFILE_LOG_BASE = settings.j("profiled_logs")

settings.STATIC_ROOT = '/home/algospot/www_static/'
settings.DEBUG = True
