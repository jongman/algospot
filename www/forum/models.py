# -*- coding: utf-8 -*-
from django.db import models
from django.core.urlresolvers import reverse
from django.db.models.signals import post_save, pre_delete
from django.contrib.auth.models import User
from newsfeed import publish, depublish, depublish_where

class Category(models.Model):
    """Stores a post category."""
    name = models.TextField()
    slug = models.TextField()

    def __unicode__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('forum-list', args=[self.slug, 1])

class Post(models.Model):
    """Stores a forum post."""
    title = models.CharField(u"제목", max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)
    modified_on = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, null=False)
    text = models.TextField(u"내용")
    category = models.ForeignKey(Category, null=False, verbose_name=u"게시판")

    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('forum-read', args=[self.id])

def post_handler(sender, **kwargs):
    instance, created = kwargs["instance"], kwargs["created"]
    if not created: return
    profile = instance.user.get_profile()
    profile.posts += 1
    profile.save()
    publish("forum-post-%d" % instance.id,
            "posts",
            "posted",
            actor=instance.user,
            target=instance.category,
            action_object=instance,
            timestamp=instance.created_on,
            verb=u"{target}에 글 {action_object}를 "
            u"썼습니다.")

def pre_delete_handler(sender, **kwargs):
    instance = kwargs["instance"]
    profile = instance.user.get_profile()
    profile.posts -= 1
    profile.save()
    depublish("forum-post-%d" % instance.id)
    depublish_where(type="commented", target=instance)

pre_delete.connect(pre_delete_handler, sender=Post,
                   dispatch_uid="forum_pre_delete_event")
post_save.connect(post_handler, sender=Post,
                  dispatch_uid="forum_post_event")
