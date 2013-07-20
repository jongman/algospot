from models import Activity
from django.contrib.auth.models import User, Group
from guardian.conf import settings
from guardian.shortcuts import assign_perm, get_users_with_perms

def publish(key, category, type, visible_users=None, visible_groups=None, **kwargs):
    new_activity = Activity.new(key=key, category=category, type=type, **kwargs)
    new_activity.save()

    if visible_users is None and visible_groups is None:
        anonymous = User.objects.get(pk=settings.ANONYMOUS_USER_ID)
        everyone = Group.objects.get(name='everyone')
        assign_perm('newsfeed.read_activity', anonymous, new_activity)
        assign_perm('newsfeed.read_activity', everyone, new_activity)
    else:
        for user in visible_users:
            assign_perm('newsfeed.read_activity', user, new_activity)
        for group in visible_groups:
            assign_perm('newsfeed.read_activity', group, new_activity)
    return new_activity

def depublish(key):
    Activity.objects.filter(key=key).delete()

def depublish_where(**kwargs):
    Activity.delete_all(**kwargs)

def has_activity(**kwargs):
    return Activity.objects.filter(**Activity.translate(kwargs)).count() > 0

def get_activity(**kwargs):
    return Activity.objects.get(**Activity.translate(kwargs))
