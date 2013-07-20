from django.core.management.base import NoArgsCommand
from django.contrib.auth.models import User, Group
from judge.models import Problem
from guardian.conf import settings
from guardian.shortcuts import assign_perm

class Command(NoArgsCommand):
    def handle(self, **options):
        for x in Problem.objects.all():
            assign_perm('judge.edit_problem', x.user, x)
