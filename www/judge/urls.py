# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
import views

urlpatterns = patterns('judge.views',
        url(r'^$', views.index,
            name='judge-index'),
        url(r'^problem/read/(?P<slug>.+)$', views.problem.read,
            name='judge-problem-read'),
        url(r'^problem/submit/(?P<slug>.+)$', views.problem.submit,
            name='judge-problem-submit'),
        url(r'^submission/detail/(?P<id>.+)$', views.submission.details,
            name='judge-submission-details'),
        url(r'^submission/mine/$', views.submission.mine,
            name='judge-submission-mine'),
        url(r'^submission/recent/$', views.submission.recent,
            name='judge-submission-recent'),
        url(r'^submission/recent/(?P<page>.+)/$', views.submission.recent,
            name='judge-submission-recent'),
        )

