# -*- coding: utf-8 -*-
from django.db import models
from django.core.urlresolvers import reverse
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.conf import settings

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
    title = models.TextField(max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, null=False)
    text = models.TextField()
    category = models.ForeignKey(Category, null=False)

    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('forum-read', args=[self.id])

if "actstream" in settings.INSTALLED_APPS:
    from actstream import action
    def post_handler(sender, **kwargs):
        instance, created = kwargs["instance"], kwargs["created"]
        if not created: return
        action.send(instance.user,
                action_object=instance,
                target=instance.category,
                verb=u"{actor}가 {target}에 글 {action_object}를 "
                u"쓰셨습니다.")
    post_save.connect(post_handler, sender=Post, 
            dispatch_uid="forum_post_event")
