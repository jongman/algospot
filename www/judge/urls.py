# -*- coding: utf-8 -*-
from django.conf.urls.defaults import patterns, url
import views

urlpatterns = patterns(
    'judge.views',
    url(r'^$', views.index,
        name='judge-index'),
    url(r'^ranking/$', views.ranking, name='judge-ranking'),
    url(r'^ranking/(?P<page>.+)/$', views.ranking, name='judge-ranking'),

    url(r'^problem/read/(?P<slug>.+)$', views.problem.read,
        name='judge-problem-read'),

    url(r'^problem/mine/$', views.problem.my_problems, name='judge-problem-mine'),
    url(r'^problem/mine/(?P<page>.+)/$', views.problem.my_problems, name='judge-problem-mine'),

    url(r'^problem/new/$', views.problem.new, name='judge-problem-new'),
    url(r'^problem/delete/(?P<id>.+)/$', views.problem.delete, name='judge-problem-delete'),

    url(r'^problem/list/$', views.problem.list, name='judge-problem-list'),
    url(r'^problem/list/(?P<page>.+)$', views.problem.list, name='judge-problem-list'),

    url(r'^problem/stat/(?P<slug>[^/]+)/$', views.problem.stat,
        name='judge-problem-stat'),
    url(r'^problem/stat/(?P<slug>[^/]+)/(?P<page>.+)/$', views.problem.stat, name='judge-problem-stat'),

    url(r'^problem/attachment/list/(?P<id>.+)$', views.problem.list_attachments,
        name='judge-problem-list-attachments'),
    url(r'^problem/attachment/delete/(?P<id>.*)$', views.problem.delete_attachment,
        name='judge-problem-delete-attachment'),

    url(r'^problem/attachment/add/(?P<id>.*)$', views.problem.add_attachment,
        name='judge-problem-add-attachment'),

    url(r'^problem/submit/(?P<slug>.+)$', views.problem.submit,
        name='judge-problem-submit'),

    url(r'^problem/edit/(?P<id>.+)$', views.problem.edit,
        name='judge-problem-edit'),

    url(r'^submission/detail/(?P<id>.+)$', views.submission.details,
        name='judge-submission-details'),
    url(r'^submission/recent/$', views.submission.recent,
        name='judge-submission-recent'),
    url(r'^submission/recent/(?P<page>.+)$', views.submission.recent,
        name='judge-submission-recent'),
    url(r'^submission/rejudge/(?P<id>.+)$', views.submission.rejudge,
        name='judge-submission-rejudge'),

)

