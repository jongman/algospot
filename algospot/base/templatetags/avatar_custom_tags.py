from django import template

register = template.Library()

@register.filter
def avatar_url(value):
    return value.avatar_url(80)
