# -*- coding: utf-8 -*-
from django import template

register = template.Library()

@register.filter
def aggregate_by_user(page):
    # aggregate by actor
    aggregated = []
    for action in page:
        if not aggregated or aggregated[-1][0] != action.actor:
            aggregated.append((action.actor, []))
        aggregated[-1][1].append(action)
    return aggregated

