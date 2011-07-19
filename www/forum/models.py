# -*- coding: utf-8 -*-
from django.db import models
from django.core.urlresolvers import reverse
from django.db.models.signals import post_save, pre_delete
from django.contrib.auth.models import User
from django.contrib.comments.models import Comment
from django.conf import settings
from django.contrib.contenttypes.models import ContentType

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
    user = models.ForeignKey(User, null=False)
    text = models.TextField(u"내용")
    category = models.ForeignKey(Category, null=False, verbose_name=u"게시판")

    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('forum-read', args=[self.id])

if "actstream" in settings.INSTALLED_APPS:
    from actstream import action
    from actstream.models import Action
    def post_handler(sender, **kwargs):
        instance, created = kwargs["instance"], kwargs["created"]
        if not created: return
        profile = instance.user.get_profile()
        profile.posts += 1
        profile.save()
        action.send(instance.user,
                action_object=instance,
                target=instance.category,
                timestamp=instance.created_on,
                verb=u"{target}에 글 {action_object}를 "
                u"썼습니다.")
    def pre_delete_handler(sender, **kwargs):
        instance = kwargs["instance"]
        profile = instance.user.get_profile()
        profile.posts -= 1
        profile.save()
        post_type = ContentType.objects.get(app_label="forum",
                model="post")
        # delete action for posting
        Action.objects.filter(action_object_content_type=post_type,
                action_object_object_id=instance.id).delete()
        # delete actions for comments
        Action.objects.filter(target_content_type=post_type,
                target_object_id=instance.id).delete()

    pre_delete.connect(pre_delete_handler, sender=Post,
            dispatch_uid="forum_pre_delete_event")
    post_save.connect(post_handler, sender=Post,
            dispatch_uid="forum_post_event")
