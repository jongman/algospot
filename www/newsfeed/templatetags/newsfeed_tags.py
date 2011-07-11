# -*- coding: utf-8 -*-
from django.utils.safestring import mark_safe
from django.contrib.comments.models import Comment
from django import template

register = template.Library()

@register.filter
def format_action(activity):
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
    return mark_safe(activity.verb.format(actor=wrap_in_link(activity.actor),
            action_object=wrap_in_link(activity.action_object),
            target=wrap_in_link(activity.target)))
