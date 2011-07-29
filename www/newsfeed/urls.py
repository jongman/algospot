# -*- coding: utf-8 -*-
from django.conf.urls.defaults import patterns, url
import views
urlpatterns = patterns(
    'newsfeed.views',
    url(r'^$', views.stream, name='newsfeed'),
    url(r'^(?P<page>.+)/$', views.stream, name='newsfeed'),
)

