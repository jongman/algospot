# -*- coding: utf-8 -*-
from django.utils.safestring import mark_safe
from django.contrib.comments.models import Comment
from django import template

register = template.Library()

@register.filter
def aggregate_by_user(page):
    # aggregate by actor
    aggregated = []
    for action in page.object_list:
        if not aggregated or aggregated[-1][0] != action.actor:
            aggregated.append((action.actor, []))
        aggregated[-1][1].append(action)
    return aggregated

