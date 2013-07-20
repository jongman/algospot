from django.core.management.base import NoArgsCommand
from django.contrib.auth.models import User, Group
from newsfeed.models import Activity
from guardian.conf import settings
from guardian.shortcuts import assign_perm

class Command(NoArgsCommand):
    def handle(self, **options):
        everyone = Group.objects.get(name='everyone')
        anonymous = User.objects.get(pk=settings.ANONYMOUS_USER_ID)

        for x in Activity.objects.all():
            if not x.admin_only:
                assign_perm('newsfeed.read_activity', anonymous, x)
                assign_perm('newsfeed.read_activity', everyone, x)
                
