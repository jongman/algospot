# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os.path
import csv
import json

def parse_feed(home, filename):
    names = [line.split("`")[1] 
            for line in open(os.path.join(home, filename + ".sql")) 
            if line.startswith("  `")]
    for line in csv.reader(open(os.path.join(home, filename + ".txt"))):
        yield dict(zip(names, line))

def migrate_user(home):
    username_seen = set()
    created = 0
    for u in parse_feed(home, "GDN_User"):
        if u["Name"] in username_seen:
            print "%s is a duplicate" % u["Name"]
            continue
        if u["Deleted"] == "1": continue
        pw = (u["Password"] 
                if u["HashMethod"] != "Vanilla" 
                else "sha1$deadbeef$" + u["Password"].replace("$", "_"))
        new_user = User(id=u["UserID"],
                username = u["Name"],
                date_joined=u["DateInserted"],
                email=u["Email"],
                is_active=True,
                last_login=u["DateLastActive"],
                password=pw,
                is_superuser=(u["Admin"] == "1"))
        new_user.save()
        created += 1
        if created % 10 == 0:
            print "created %d users so far" % created
        username_seen.add(u["Name"])
    print "created %d users." % created



class Command(BaseCommand):
    args = '<csv dump directory>'
    help = 'Migrate data over from Vanilla\'s CSV dump'

    def handle(self, *args, **options):
        dump_path = args[0]
        migrate_user(dump_path)
