# -*- coding: utf-8 -*-
from django.db import models
from django.conf import settings
from django.core.urlresolvers import reverse
from django.db.models.signals import post_save
from django.contrib.auth.models import User

class PageRevision(models.Model):
    """Stores a specific revision of the page."""
    text = models.TextField()
    edit_summary = models.TextField(max_length=100, blank=True, null=True)
    user = models.ForeignKey(User, null=False)
    created_on = models.DateTimeField(auto_now_add=True)
    revision_for = models.ForeignKey('Page')

    def __unicode__(self):
        return self.revision_for.title + " " + unicode(self.created_on)

class Page(models.Model):
    """Stores a wiki page."""
    title = models.TextField(unique=True, max_length=100)
    slug = models.SlugField(unique=True, max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)
    modified_on = models.DateTimeField(auto_now=True)
    current_revision = models.ForeignKey(PageRevision, related_name='main',
            blank=True, null=True)

    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("wiki-detail", args=[self.slug])

if "actstream" in settings.INSTALLED_APPS:
    from actstream import action
    def edit_handler(sender, **kwargs):
        instance, created = kwargs["instance"], kwargs["created"]
        action.send(instance.user,
                action_object=instance.revision_for,
                verb=u"위키 페이지 {action_object}을 편집했습니다.")
    post_save.connect(edit_handler, sender=PageRevision,
            dispatch_uid="wiki_edit_event")
