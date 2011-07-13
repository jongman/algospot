# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
import views

urlpatterns = patterns('judge.views',
        url(r'^$', views.index,
            name='judge-index'),
        url(r'^problem/read/(?P<slug>.+)$', views.problem.read,
            name='judge-problem-read'),
        )

