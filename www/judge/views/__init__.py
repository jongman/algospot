# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.db.models import Count
from djangoutils import setup_paginator
from base.models import UserProfile
import problem, submission

def index(request):
    pass

def ranking(request, order_by="solved", page=1):
    profiles = UserProfile.objects.filter(submissions__gt=0)
    profiles = profiles.annotate(Count('user__problem'))
    profiles = profiles.extra(select={'ratio': 'accepted / submissions'})
    order_by_translate = {'solved': '-solved_problems',
                          'authored': '-user__problem__count',
                          'ratio': '-ratio'}
    profiles = profiles.order_by(order_by_translate[order_by])

    return render(request, "ranking.html",
                  {"title": u'사용자 랭킹',
                   "order_by": order_by,
                   "pagination": setup_paginator(profiles, page,
                                                 "judge-ranking",
                                                 {'order_by': order_by})})


