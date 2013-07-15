# -*- coding: utf-8 -*-
from django.contrib.syndication.views import Feed
from django.contrib.auth.models import User
from guardian.conf import settings
from forum.models import Post
from forum.utils import get_posts_for_user
from rendertext import render_text

class PostFeed(Feed):
    title = 'algospot.com posts'
    link = '/'
    description = u'알고스팟 새 글 목록'
    anonymous = User.objects.get(pk=settings.ANONYMOUS_USER_ID)

    def items(self):
        return get_posts_for_user(self.anonymous, 'forum.read_post').order_by('-created_on')[:30]
    def item_title(self, obj):
        return u'[%s] %s' % (obj.category.name, obj.title)
    def item_description(self, obj):
        return render_text(obj.text)
    def item_link(self, obj):
        return obj.get_absolute_url()
