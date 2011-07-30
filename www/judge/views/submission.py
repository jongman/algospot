# -*- coding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from djangoutils import setup_paginator, get_or_none
from django.contrib.auth.models import User
from ..models import Problem, Submission

@login_required
def mine(request):
    return redirect(reverse("judge-submission-recent"))

def recent(request, page=1):
    submissions = Submission.objects.all().order_by("-id")

    filters = {}

    empty_message = u"제출된 답안이 없습니다."
    title_add = []

    if "problem" in request.GET:
        slug = request.GET["problem"]
        problem = get_or_none(Problem, slug=slug)

        if not problem:
            empty_message = u"해당 문제가 없습니다."
            submissions = submissions.none()
        else:
            submissions = submissions.filter(problem=problem)

        title_add.append(u"문제 " + slug)
        filters["problem"] = slug

    if "state" in request.GET:
        state = request.GET["state"]
        submissions = submissions.filter(state=state)
        filters["state"] = state
        title_add.append(Submission.STATES_KOR[int(state)])

    if "order_by" in request.GET:
        order_by = request.GET["order_by"]
        submissions = submissions.order_by(order_by)

    if "user" in request.GET:
        username = request.GET["user"]
        user = get_or_none(User, username=username)
        if not user:
            empty_message = u"해당 사용자가 없습니다."
            submissions = submissions.none()
        else:
            submissions = submissions.filter(user=user)
        filters["user"] = username
        title_add.append(u"사용자 " + username)

    return render(request, "submission/recent.html",
                  {"title": u"답안 목록" + (": " if title_add else "") +
                   ",".join(title_add),
                   "filters": filters,
                   "empty_message": empty_message,
                   "pagination": setup_paginator(submissions, page,
                                                 "judge-submission-recent", {}, filters)})

def details(request, id):
    submission = get_object_or_404(Submission, id=id)
    problem = submission.problem
    return render(request, "submission/details.html",
                  {"title": u"답안 보기",
                   "submission": submission,
                   "problem": problem})
