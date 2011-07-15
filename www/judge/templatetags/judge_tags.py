# -*- coding: utf-8 -*-
from django import template

register = template.Library()

class PercentNode(template.Node):
    def __init__(self, a, b):
        self.a = template.Variable(a)
        self.b = template.Variable(b)
    def render(self, context):
        a = self.a.resolve(context)
        b = self.b.resolve(context)
        return str(a * 100 / b) if b else "0"

@register.tag
def percentage(parser, token):
    toks = token.split_contents()
    a, b = toks[1:3]
    return PercentNode(a, b)

@register.filter
def print_length(length):
    if length < 1024: return "%dB" % length
    return "%.1lfKB" % (length / 1024.)
