# -*- coding: utf-8 -*-
from django.conf.urls.defaults import patterns, url
import views
urlpatterns = patterns(
    'base.views',
    url(r'^profile/(?P<user_id>.+)$', views.profile, name='user_profile'),
    url(r'^settings/(?P<user_id>.+)$', views.settings, name='user_settings'),
)

