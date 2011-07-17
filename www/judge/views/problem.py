# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404, redirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.http import Http404
from ..models import Problem
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
