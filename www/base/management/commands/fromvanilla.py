# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

def migrate_user():
    pass

class Command(BaseCommand):
    args = '<csv dump directory>'
    help = 'Migrate data over from Vanilla\'s CSV dump'

    def handle(self, *args, **options):
        dump_path = args[0]
        migrate_user()
