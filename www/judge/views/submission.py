# -*- coding: utf-8 -*-
from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from djangoutils import setup_paginator, get_or_none
from django.contrib.auth.models import User
from django.http import HttpResponseForbidden
from ..models import Problem, Submission
from django.contrib.auth.decorators import login_required

def rejudge(request, id):
    submission = get_object_or_404(Submission, id=id)
    if submission.user != request.user and not request.user.is_superuser:
        return HttpResponseForbidden()
    submission.rejudge()
    return redirect(reverse("judge-submission-details", kwargs={"id": id}))

def recent(request, page=1):
    submissions = Submission.objects.all().order_by("-id")

    filters = {}

    empty_message = u"제출된 답안이 없습니다."
    title_add = []

    # only superuser can see all nonpublic submissions.
    # as an exception, if we are filtering by a problem, the author can see
    # nonpublic submissions. also, everybody can see their nonpublic
    # submissions.
    only_public = not request.user.is_superuser

    if request.GET.get("problem"):
        slug = request.GET["problem"]
        problem = get_or_none(Problem, slug=slug)
        if request.user == problem.user:
            only_public = False

        if (not problem or
                (problem.state != Problem.PUBLISHED and
                 not request.user.is_superuser and
                 request.user != problem.user)):
            empty_message = u"해당 문제가 없습니다."
            submissions = submissions.none()
        else:
            submissions = submissions.filter(problem=problem)

        title_add.append(slug)
        filters["problem"] = slug

    if "state" in request.GET:
        state = request.GET["state"]
        submissions = submissions.filter(state=state)
        filters["state"] = state
        title_add.append(Submission.STATES_KOR[int(state)])

    if request.GET.get("user"):
        username = request.GET["user"]
        user = get_or_none(User, username=username)
        if not user:
            empty_message = u"해당 사용자가 없습니다."
            submissions = submissions.none()
        else:
            submissions = submissions.filter(user=user)
        filters["user"] = username
        title_add.append(username)
        if user == request.user:
            only_public = False

    if only_public:
        submissions = submissions.filter(is_public=True)

    problems = Problem.objects.filter(state=Problem.PUBLISHED).order_by("slug")
    users = User.objects.order_by("username")

    return render(request, "submission/recent.html",
                  {"title": u"답안 목록" + (": " if title_add else "") +
                   ",".join(title_add),
                   "problems": problems,
                   "users": users,
                   "filters": filters,
                   "empty_message": empty_message,
                   "pagination": setup_paginator(submissions, page,
                                                 "judge-submission-recent", {}, filters)})

@login_required
def details(request, id):
    submission = get_object_or_404(Submission, id=id)
    problem = submission.problem
    if (not problem.was_solved_by(request.user) and
            not request.user.is_superuser and
            submission.user != request.user and
            problem.user != request.user):
        return HttpResponseForbidden()
    return render(request, "submission/details.html",
                  {"title": u"답안 보기",
                   "submission": submission,
                   "problem": problem})
