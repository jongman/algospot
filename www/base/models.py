# -*- coding: utf-8 -*-

from django.db import models
from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

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
