# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from django.utils.safestring import mark_safe
from django.contrib.comments.models import Comment
import datetime

class Activity(models.Model):
    # 액션 고유 ID. 지울 때 쓴다. 예: judge-problem-opened-417
    key = models.CharField(max_length=255, db_index=True, unique=True)
    # 액션 카테고리. 카테고리별 뉴스피드를 볼 때 쓴다. 예: wiki, judge,
    # membership
    category = models.CharField(max_length=64, db_index=True)
    # 액션 타입. css 클래스를 정하는 데 쓴다.. -_-; 예: wiki-edit,
    # problem-solved, posted, commented
    type = models.CharField(max_length=64)
    # 액터
    actor = models.ForeignKey(User, null=True, related_name='actor')
    # {actor} {target} {action_object} 를 갖는 문자열
    verb = models.CharField(max_length=255)

    admin_only = models.BooleanField(default=False)

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
    timestamp = models.DateTimeField(db_index=True)

    @staticmethod
    def translate(kwargs):
        args = {}
        for k, v in kwargs.iteritems():
            if k in ["target", "action_object"]:
                ct = ContentType.objects.get_for_model(v.__class__)
                pk = v.id
                args[k + "_content_type"] = ct
                args[k + "_object_id"] = pk
            else:
                args[k] = v
        return args

    @staticmethod
    def new(**kwargs):
        if "timestamp" not in kwargs:
            kwargs["timestamp"] = datetime.datetime.now()
        return Activity(**Activity.translate(kwargs))

    @staticmethod
    def delete_all(**kwargs):
        return Activity.objects.filter(**Activity.translate(kwargs)).delete()

    def render(self):
        from judge.models import Problem
        def wrap_in_link(object):
            if not object: return ""
            if isinstance(object, Comment):
                if isinstance(self.target, Problem) or "<spoiler>" in object.comment :
                    unicode_rep = u"[스포일러 방지를 위해 보이지 않습니다]"
                else:
                    unicode_rep = object.comment
                    if len(unicode_rep) > 50:
                        unicode_rep = unicode_rep[:47] + ".."
            else:
                unicode_rep = unicode(object)
            if object.get_absolute_url:
                return "".join(['<a href="%s">' % object.get_absolute_url(),
                    unicode_rep,
                    '</a>'])
            return unicode_rep
        return mark_safe(self.verb.format(actor=wrap_in_link(self.actor),
                                          action_object=wrap_in_link(self.action_object),
                                          target=wrap_in_link(self.target)))
