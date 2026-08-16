# -*- coding: utf-8 -*-
from django.contrib.syndication.views import Feed
from django.contrib.auth.models import User
from django.conf import settings
from forum.models import Post
from forum.utils import get_posts_for_user
from rendertext import render_text

class PostFeed(Feed):
    title = 'algospot.com posts'
    link = '/'
    description = '알고스팟 새 글 목록'
    def items(self):
        # URL configuration and Django system checks import this class before
        # PostgreSQL is necessarily reachable. Resolve the legacy anonymous
        # account only while serving the feed.
        anonymous = User.objects.get(pk=settings.ANONYMOUS_USER_ID)
        return get_posts_for_user(
            anonymous, 'forum.read_post').order_by('-created_on')[:10]
    def item_title(self, obj):
        return '[%s] %s' % (obj.category.name, obj.title)
    def item_description(self, obj):
        return render_text(obj.text)
    def item_link(self, obj):
        return obj.get_absolute_url()
