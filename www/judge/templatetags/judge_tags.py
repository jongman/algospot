# -*- coding: utf-8 -*-
from django import template
from ..models import Submission

register = template.Library()

class HasSolvedNode(template.Node):
    def __init__(self, problem, user, result):
        self.problem = template.Variable(problem)
        self.user = template.Variable(user)
        self.result = result
    def render(self, context):
        problem = self.problem.resolve(context)
        user = self.user.resolve(context)
        ret = (Submission.objects.filter(problem=problem, user=user,
                                         state=Submission.ACCEPTED).count() > 0)
        context[self.result] = ret
        return ""

@register.tag
def get_has_solved(parser, token):
    toks = token.split_contents()
    problem, by, user, as_, solved = toks[1:]
    return HasSolvedNode(problem, user, solved)

@register.filter
def print_length(length):
    if length < 1024: return "%dB" % length
    return "%.1lfKB" % (length / 1024.)
