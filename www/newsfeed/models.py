# -*- coding: utf-8 -*-
from django.db import models

from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User

class Activity(models.Model):
    # 액션 고유 ID. 지울 때 쓴다. 예: judge-problem-opened-417
    key = models.CharField(max_length=255, db_index=True, unique=True)
    # 액션 카테고리. 카테고리별 뉴스피드를 볼 때 쓴다. 예: wiki, judge,
    # membership
    category = models.CharField(max_length=64, db_index=True)
    # 액터
    actor = models.ForeignKey(User, null=True, related_name='actor')
    # {actor} {target} {action_object} 를 갖는 문자열
    verb = models.CharField(max_length=255)

    target_content_type = models.ForeignKey(ContentType,
                                            related_name='target_content_type',
                                            blank=True,
                                            null=True)
    target_object_id = models.PositiveIntegerField(blank=True,
                                                   null=True)
    target = generic.GenericForeignKey('target_content_type','target_object_id')

    action_object_content_type = models.ForeignKey(ContentType,
                                                   related_name='action_object_content_type',
                                                   blank=True,
                                                   null=True)
    action_object_object_id = models.PositiveIntegerField(blank=True,null=True)
    action_object = generic.GenericForeignKey('action_object_content_type',
                                              'action_object_object_id')
    timestamp = models.DateTimeField(auto_now_add=True)

