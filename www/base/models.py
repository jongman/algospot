# -*- coding: utf-8 -*-

from django.conf import settings
from django.db import models
from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.contrib.comments.models import Comment
from django.contrib.contenttypes.models import ContentType
from actstream import action
from actstream.models import Action

# 이만큼은 문제를 풀어야 위키 변경 등의 일을 할 수 있다.
USER_AUTHORIZATION_LIMIT = 5

class UserProfile(models.Model):
    """Stores additional information about users."""
    user = models.OneToOneField(User)
    posts = models.IntegerField(null=False, default=0)
    submissions = models.IntegerField(null=False, default=0)
    solved_problems = models.IntegerField(null=False, default=0)
    intro = models.TextField(default="")

    def is_authorized(self):
        return self.solved_problems >= USER_AUTHORIZATION_LIMIT

@receiver(post_save, sender=User)
def user_added(sender, **kwargs):
    """ automatically create profile classes when a user is created."""
    if kwargs["created"]:
        profile = UserProfile(user=kwargs["instance"])
        profile.save()

@receiver(pre_delete, sender=User)
def deleting_user(sender, **kwargs):
    sender.get_profile().delete()


def comment_handler(sender, **kwargs):
    instance, created = kwargs["instance"], kwargs["created"]
    profile = instance.user.get_profile()
    if created:
        target = instance.content_object
        action.send(instance.user,
                action_object=instance,
                target=target,
                timestamp=instance.submit_date,
                verb=u"{target}에 새 댓글을 달았습니다: "
                u"{action_object}")
        profile.posts += 1
    elif instance.is_removed:
        profile.posts -= 1
        comment_type = ContentType.objects.get(app_label="comments",
                model="comment")
        Action.objects.filter(action_object_content_type=comment_type,
                action_object_object_id=instance.id).delete()
    profile.save()

post_save.connect(comment_handler, sender=Comment,
        dispatch_uid="comment_event")
