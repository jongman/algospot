# -*- coding: utf-8 -*-

import settings

settings.DEBUG = True
USE_TOOLBAR = False
USE_PROFILING = False
# USE_TOOLBAR = True

# Use django debug toolbar
if USE_TOOLBAR:
    settings.MIDDLEWARE_CLASSES += ('debug_toolbar.middleware.DebugToolbarMiddleware',)
    settings.INSTALLED_APPS += ('debug_toolbar',)

if USE_PROFILING:
    settings.PROFILE_LOG_BASE = settings.j("profiled_logs")

settings.STATIC_ROOT = '/home/being/algospot/static'
# setup ghetto celery queue settings
#settings.BROKER_BACKEND = "djkombu.transport.DatabaseTransport"
#settings.INSTALLED_APPS += ("djkombu",)

#settings.MEDIA_URL = 'http://127.0.0.1:8000/media/'
