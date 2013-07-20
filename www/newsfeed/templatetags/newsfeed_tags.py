# -*- coding: utf-8 -*-
from django import template
from django.contrib.comments.models import Comment
from guardian.shortcuts import get_perms
from judge.models import Problem, Solver

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

@register.simple_tag
def render_activity(*args, **kwargs):
    activity = kwargs['activity']
    user = kwargs['user']

    hide_spoiler = False
    if isinstance(activity.action_object, Comment):
        if "<spoiler>" in activity.action_object.comment:
            hide_spoiler = True
        if isinstance(activity.target, Problem):
            hide_spoiler = True
            if not user.is_anonymous() and Solver.objects.filter(problem=activity.target, solved=True, user=user).exists():
                hide_spoiler = False
            elif get_perms(user, activity.target): # read and/or edit
                hide_spoiler = False
    return activity.render(spoiler_replacement=u"[스포일러 방지를 위해 보이지 않습니다]" if hide_spoiler else None)
