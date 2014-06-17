# -*- coding: utf-8 -*-

from django.db import models
from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.comments.models import Comment
from django.conf import settings
from guardian.shortcuts import get_perms, get_users_with_perms, get_groups_with_perms
from judge.models import Problem
from newsfeed import publish, depublish

class UserProfile(models.Model):
    """Stores additional information about users."""
    user = models.OneToOneField(User)
    posts = models.IntegerField(null=False, default=0)

    submissions = models.IntegerField(null=False, default=0)
    accepted = models.IntegerField(null=False, default=0)
    solved_problems = models.IntegerField(null=False, default=0)

    intro = models.TextField(default="")

    def is_authorized(self):
        return (self.solved_problems >= settings.USER_AUTHORIZATION_LIMIT or 
                self.user.is_superuser)

@receiver(post_save, sender=User)
def user_added(sender, **kwargs):
    if kwargs["created"]:
        user = kwargs["instance"]
        """ add the user to group 'everyone'. """
        Group.objects.get(name='everyone').user_set.add(user)

        """ automatically create profile classes when a user is created."""
        profile = UserProfile(user=user)
        profile.save()
        # publish("joined-%d" % user.id ,
        #         "other",
        #         "joined",
        #         actor=user,
        #         verb=u"가입했습니다.")

@receiver(pre_delete, sender=User)
def deleting_user(sender, **kwargs):
    user = kwargs["instance"]
    user.get_profile().delete()
    # depublish("joined-%d" % user.id)

def comment_handler(sender, **kwargs):
    instance, created = kwargs["instance"], kwargs["created"]
    profile = instance.user.get_profile()
    target = instance.content_object

    ctype = ContentType.objects.get_for_model(target)
    visible_users = None
    visible_groups = None
    if ctype.name == 'post':
        print 'post'
        print target.category
        visible_users = get_users_with_perms(target.category, with_group_users=False)
        visible_groups = get_groups_with_perms(target.category)
    if ctype.name == 'problem' and target.state != Problem.PUBLISHED:
        visible_users = get_users_with_perms(target, with_group_users=False)
        visible_groups = get_groups_with_perms(target)

    print visible_users
    print visible_groups

    if created:
        publish("comment-%d" % instance.id,
                "posts",
                "commented",
                actor=instance.user,
                action_object=instance,
                target=target,
                timestamp=instance.submit_date,
                visible_users=visible_users,
                visible_groups=visible_groups,
                verb=u"{target}에 새 댓글을 달았습니다: "
                u"{action_object}")
        profile.posts += 1
    elif instance.is_removed:
        depublish("comment-%d" % instance.id)
        profile.posts -= 1
    profile.save()

post_save.connect(comment_handler, sender=Comment,
                  dispatch_uid="comment_event")
