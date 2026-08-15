#!/usr/bin/env python2
"""Run Django 1.7 without attempting migration-recorder writes at startup."""

from __future__ import print_function

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'algospot.legacy_settings')

from django.core.management import execute_from_command_line
from django.core.management.commands.runserver import Command


def skip_migration_check(self):
    print('Skipping Django migration check in read-only bridge runtime.')


# Django 1.7's runserver creates django_migrations while checking for pending
# migrations. The characterization role must never gain that write access.
Command.check_migrations = skip_migration_check

execute_from_command_line([
    'manage.py', 'runserver', '0.0.0.0:8000', '--noreload',
])
