# -*- coding: utf-8 -*-
from django.conf.urls import patterns, url
import views
urlpatterns = patterns(
    'base.views',
    url(r'^profile/(?P<user_id>.+)$', views.profile, name='user_profile'),
    url(r'^username/(?P<username>.+)$', views.profile_by_username,
        name='user_username'),
    url(r'^settings/(?P<user_id>.+)$', views.settings, name='user_settings'),
    url(r'^list$', views.list_users, name='list_users')
)

