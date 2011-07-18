# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404, redirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.http import Http404
from djangoutils import setup_paginator
from ..models import Problem, Submission
from ..forms import SubmitForm, AdminSubmitForm, ProblemEditForm

@login_required
def edit(request, id):
    problem = get_object_or_404(Problem, id=id)
    if not request.user.is_superuser and problem.user != request.user:
        raise Http404
    form = ProblemEditForm(data=request.POST or None, instance=problem)
    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect(reverse("judge-problem-read",
            kwargs={"slug": form.cleaned_data["slug"]}));
    breadcrumbs = [(reverse("judge-index"), u"온라인 저지"),
            (None, "문제 편집")]
    return render(request, "problem/edit.html", {"problem": problem,
        "form": form,
        "breadcrumbs": breadcrumbs})

def list(request, page=1):
    breadcrumbs = [(reverse("judge-index"), u"온라인 저지"),
                   (reverse("judge-problem-list"), u"문제 목록")]
    problems = Problem.objects.all().order_by("slug")
    # options = {}
    # TODO: 카테고리별 문제 보기
    # TODO: 난이도 순으로 정렬하기
    return render(request, "problem/list.html",
                  {"title": u"문제 목록 보기",
                   "breadcrumbs": breadcrumbs,
                   "ACCEPTED": Submission.ACCEPTED,
                   "pagination": setup_paginator(problems, page,
                                                 "judge-problem-list", {})})
def read(request, slug):
    problem = get_object_or_404(Problem, slug=slug)
    breadcrumbs = [(reverse("judge-index"), u"온라인 저지"),
            (reverse("judge-problem-read", kwargs={"slug":slug}),
                problem.slug)]
    return render(request, "problem/read.html", {"problem": problem,
        "breadcrumbs": breadcrumbs})

def submit(request, slug):
    problem = get_object_or_404(Problem, slug=slug)
    if request.user == problem.user or request.user.is_superuser:
        form = AdminSubmitForm(data=request.POST or None)
    else:
        form = SubmitForm(data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        return redirect(reverse("judge-submission-mine"))

    breadcrumbs = [(reverse("judge-index"), u"온라인 저지"),
            (reverse("judge-problem-read", kwargs={"slug":slug}),
                problem.slug),
            (reverse("judge-problem-submit", kwargs={"slug":slug}),
                u"제출하기")]
    return render(request, "problem/submit.html", {"form": form,
        "breadcrumbs": breadcrumbs, "problem": problem})
