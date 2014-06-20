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

# scala 사용하려면 아래 커멘트를 지울 것. VM 용량도 Vagrantfile에서 늘려줘야
# 한다.
# settings.JUDGE_SETTINGS['MINMEMORYSIZE'] = 512 * 1024

# monkey patch pygooglecharts around some unknown issue.
# this is a broken mirror; but we should be getting rid of pygooglechart
# anyways..
import pygooglechart
pygooglechart.Chart.BASE_URL = 'http://chart.apis.google.com/chart'
