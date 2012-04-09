# -*- coding: utf-8 -*-
from django.core.urlresolvers import reverse
from django.utils.html import escape
from models import Problem

def link_to_problem(slug, display):
    problem = Problem.objects.get(slug=slug)
    link = reverse("judge-problem-read", kwargs={"slug": slug})
    return u'<a class="problem" href="%s" title="%s">%s</a>' % (link, problem.name, escape(display or slug))
