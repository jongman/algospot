# -*- coding: utf-8 -*-

import settings

settings.DEBUG = True
settings.STATIC_ROOT = '/vagrant/www_static'

settings.USER_AUTHORIZATION_LIMIT = 0

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

# monkey patch pygooglecharts around some unknown issue.
# this is a broken mirror; but we should be getting rid of pygooglechart
# anyways..
import pygooglechart
pygooglechart.Chart.BASE_URL = 'http://chart.apis.google.com/chart'
