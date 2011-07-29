# -*- coding: utf-8 -*-

from django.db import models
from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.contrib.comments.models import Comment
from newsfeed import publish, depublish

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
        user = kwargs["instance"]
        profile = UserProfile(user=user)
        profile.save()
        publish("joined-%d" % user.id ,
                "other",
                "joined",
                actor=user,
                verb=u"가입했습니다.")

@receiver(pre_delete, sender=User)
def deleting_user(sender, **kwargs):
    user = kwargs["instance"]
    user.get_profile().delete()
    depublish("joined-%d" % user.id)

def comment_handler(sender, **kwargs):
    instance, created = kwargs["instance"], kwargs["created"]
    profile = instance.user.get_profile()
    target = instance.content_object
    if created:
        publish("comment-%d" % instance.id,
                "posts",
                "commented",
                actor=instance.user,
                action_object=instance,
                target=target,
                timestamp=instance.submit_date,
                verb=u"{target}에 새 댓글을 달았습니다: "
                u"{action_object}")
        profile.posts += 1
    elif instance.is_removed:
        depublish("comment-%d" % instance.id)
        profile.posts -= 1
    profile.save()

post_save.connect(comment_handler, sender=Comment,
                  dispatch_uid="comment_event")
