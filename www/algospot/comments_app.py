# -*- coding: utf-8 -*-
"""App configuration preserving the built-in comments content-type label."""

from django.apps import AppConfig


class LegacyCommentsConfig(AppConfig):
    name = 'django_comments'
    label = 'comments'
    verbose_name = 'Comments'
