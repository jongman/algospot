from django.core.management.base import NoArgsCommand
from django.contrib.auth.models import User, Group

class Command(NoArgsCommand):
    def handle(self, **options):
        everyone = Group.objects.get(name='everyone')
        for x in User.objects.all():
            everyone.user_set.add(x)
