# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.db.models import Count
from djangoutils import setup_paginator
from base.models import UserProfile
from django.shortcuts import redirect
from django.core.urlresolvers import reverse
import problem, submission

def index(request):
    return redirect(reverse('judge-problem-list'))

def ranking(request, page=1):
    profiles = UserProfile.objects.filter(submissions__gt=0)
    profiles = profiles.annotate(Count('user__problem'))
    profiles = profiles.extra(select={'ratio': '1.0 * accepted / submissions'})
    order_by = request.GET.get('order_by', 'solved')
    order_by_translate = {'solved': '-solved_problems',
                          'authored': '-user__problem__count',
                          'ratio': '-ratio'}
    profiles = profiles.order_by(order_by_translate[order_by])

    return render(request, "ranking.html",
                  {"title": u'사용자 랭킹',
                   "pagination": setup_paginator(profiles, page,
                                                 "judge-ranking",
                                                 {}, request.GET)})


