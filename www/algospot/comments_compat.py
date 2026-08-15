# -*- coding: utf-8 -*-
"""Comments imports shared by the archived and replacement applications."""

from django.conf import settings


if 'django.contrib.comments' not in settings.INSTALLED_APPS:
    from django_comments.models import Comment
    from django_comments.templatetags.comments import BaseCommentNode
    from django_comments.views.moderation import perform_delete
else:
    from django.contrib.comments.models import Comment
    from django.contrib.comments.templatetags.comments import BaseCommentNode
    from django.contrib.comments.views.moderation import perform_delete
