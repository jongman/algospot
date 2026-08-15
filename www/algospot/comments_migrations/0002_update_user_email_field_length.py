# -*- coding: utf-8 -*-
"""Keep upstream operations while preserving the legacy dependency label."""

from importlib import import_module


UpstreamMigration = import_module(
    'django_comments.migrations.0002_update_user_email_field_length').Migration


class Migration(UpstreamMigration):
    dependencies = [
        ('comments' if app == 'django_comments' else app, name)
        for app, name in UpstreamMigration.dependencies
    ]
