# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
import views

urlpatterns = patterns('wiki.views',
        url(r'^read/(?P<slug>.+)$', views.detail, name='wiki-detail'),
        url(r'^edit/(?P<slug>.+)$', views.edit, name='wiki-edit'),
        )

