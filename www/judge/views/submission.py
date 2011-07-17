# -*- coding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse
from djangoutils import setup_paginator, get_or_none, get_query
from django.contrib.auth.models import User
from ..models import Problem, Submission

@login_required
def mine(request):
    return redirect(reverse("judge-submission-recent"))

def recent(request, page=1):
    breadcrumbs = [(reverse("judge-index"), u"온라인 저지"),
            (request.path, u"답안 목록")]
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
        filters["problem"] = request.GET["problem"]
        breadcrumbs.append((request.path + get_query(filters), slug))
    if "user" in request.GET:
        username = request.GET["user"]
        user = get_or_none(User, username=username)
        if not user:
            empty_message = u"해당 사용자가 없습니다."
            submissions = submissions.none()
        else:
            submissions = submissions.filter(user=user)
        filters["user"] = request.GET["user"]
        title_add.append(u"사용자 " + username)
        breadcrumbs.append((request.path + get_query(filters), username))

    return render(request, "submission/recent.html",
            {"title": u"답안 목록" + (": " if title_add else "") +
                ",".join(title_add),
             "breadcrumbs": breadcrumbs,
             "filters": filters,
             "empty_message": empty_message,
             "pagination": setup_paginator(submissions, page,
                 "judge-submission-recent", {}, filters)})

def details(request, id):
    pass
