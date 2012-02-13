# -*- coding: utf-8 -*-
from django.conf.urls.defaults import patterns, url
import views
urlpatterns = patterns(
    'newsfeed.views',
    url(r'^$', views.stream, name='newsfeed'),
    url(r'^(?P<page>[0-9]+)/$', views.stream, name='newsfeed'),
    url(r'^user/(?P<id>[0-9]+)$', views.by_user, name='newsfeed-byuser'),
    url(r'^user/(?P<id>[0-9]+)/(?P<page>[0-9]+)/$', views.by_user, name='newsfeed-byuser'),
)

