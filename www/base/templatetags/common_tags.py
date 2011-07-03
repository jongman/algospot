# -*- coding: utf-8 -*-

from __future__ import division
from django import template
import datetime

register = template.Library()

@register.filter
def print_datetime(dt):
    diff = datetime.datetime.now() - dt
    if diff.seconds < 60:
        return u"방금 전"
    if diff.seconds < 60*60:
        return u"%d분 전" % (diff.seconds // 60)
    if diff.seconds < 6*60*60:
        return u"%d시간 전" % (diff.seconds // (60*60))
    return dt.strftime("%Y/%m/%d %H:%M")
