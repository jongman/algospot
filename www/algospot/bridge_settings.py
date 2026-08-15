# -*- coding: utf-8 -*-
"""Django 1.7 settings for the South-to-native migration bridge."""

import os

from django.core.exceptions import ImproperlyConfigured

from algospot.legacy_settings import *


# South remains available to Django 1.6 through SOUTH_MIGRATION_MODULES, but
# must not shadow Django's native `migrate` command in the bridge runtime.
INSTALLED_APPS = tuple(
    app for app in INSTALLED_APPS
    if app != 'south'
)


if os.environ.get('BRIDGE_ALLOW_DATABASE_WRITES') == 'scratch-only':
    if DATABASES['default']['NAME'] != 'algospot_native_migrate':
        raise ImproperlyConfigured(
            'Bridge writes are locked to algospot_native_migrate.')
    DATABASES = dict(DATABASES)
    DATABASES['default'] = dict(DATABASES['default'])
    DATABASES['default']['OPTIONS'] = {}
