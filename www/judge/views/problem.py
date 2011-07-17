# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404, redirect
from django.core.urlresolvers import reverse
from ..models import Problem, Submission
from ..forms import SubmitForm, AdminSubmitForm

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
        id = form.save(request.user, problem)
        return redirect(reverse("judge-submission-mine"))

    breadcrumbs = [(reverse("judge-index"), u"온라인 저지"),
            (reverse("judge-problem-read", kwargs={"slug":slug}),
                problem.slug),
            (reverse("judge-problem-submit", kwargs={"slug":slug}),
                u"제출하기")]
    return render(request, "problem/submit.html", {"form": form,
        "breadcrumbs": breadcrumbs, "problem": problem})
