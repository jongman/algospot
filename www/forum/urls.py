# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url
import views

urlpatterns = patterns(
    'forum.views',
    url(r'^list/(?P<slug>[^/]+)/(?P<page>[^/]+)/$', views.list,
        name='forum-list'),
    url(r'^all/(?P<page>[^/]+)/$', views.all, name='forum-all'),
    url(r'^read/(?P<id>[0-9]+)/$', views.read, name="forum-read"),
    url(r'^edit/(?P<id>[0-9]+)/$', views.write, name="forum-edit",
        kwargs={"slug": None}),
    url(r'^write/$', views.write, name="forum-write", kwargs={"id": None}),
    url(r'^write/(?P<slug>.*)/$', views.write, name="forum-write", kwargs={"id": None}),
    url(r'^delete/(?P<id>[0-9]+)/$', views.delete, name="forum-delete"),
    url(r'^by_user/(?P<id>[0-9]+)/$', views.by_user, name="forum-byuser"),
    url(r'^by_user/(?P<id>[0-9]+)/(?P<page>[0-9]+)/$', views.by_user, name="forum-byuser"),
)

