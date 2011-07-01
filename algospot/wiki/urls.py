# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
import views

urlpatterns = patterns('wiki.views',
        url(r'^(?P<slug>[^\.^/]+)/?$', views.detail, name='wiki-detail'),
        )

