# -*- coding: utf-8 -*-
"""Django 1.8 checkpoint using the external comments application."""

from algospot.bridge_settings import *


INSTALLED_APPS = tuple(
    'algospot.comments_app.LegacyCommentsConfig'
    if app == 'django.contrib.comments' else app
    for app in INSTALLED_APPS
    if app != 'djcelery'
)

COMMENTS_URLCONF = 'django_comments.urls'
MIGRATION_MODULES = {
    'comments': 'algospot.comments_migrations',
}

# Celery 3 predates AppConfig paths and tries to import every literal entry in
# INSTALLED_APPS as a package during task discovery.
CELERY_TASK_PACKAGES = tuple(
    'django_comments'
    if app == 'algospot.comments_app.LegacyCommentsConfig' else app
    for app in INSTALLED_APPS
)
