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

@register.filter
def format_action(action):
    def wrap_in_link(object):
        if not object: return ""
        if isinstance(object, Comment): 
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
    return mark_safe(action.verb.format(actor=wrap_in_link(action.actor),
            action_object=wrap_in_link(action.action_object),
            target=wrap_in_link(action.target)))

@register.filter
def determine_action_type(action):
    # is it a comment?
    if isinstance(action.action_object, Comment):
        return "commented"
    obj = action.action_object or action.target
    if obj: 
        return obj.__class__.__name__.lower()
    return ""
