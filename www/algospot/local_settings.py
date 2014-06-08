# -*- coding: utf-8 -*-

import settings

settings.DEBUG = True
settings.STATIC_ROOT = '/vagrant/www_static'

# Use a local mysql database
settings.DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'algospot',
        'USER': 'vagrant',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}

# JUDGE SETTINGS
settings.JUDGE_SETTINGS['MINMEMORYSIZE'] = 64 * 1024
