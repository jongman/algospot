# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404, redirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse
from django.core.files.storage import DefaultStorage
from djangoutils import setup_paginator, get_or_none
from ..models import Problem, Submission, Attachment
from ..forms import SubmitForm, AdminSubmitForm, ProblemEditForm
import json
import os
import hashlib

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

@login_required
def delete_attachment(request, id):
    attachment = get_object_or_404(Attachment, id=id)
    problem = attachment.problem
    if not request.user.is_superuser and problem.user != request.user:
        raise Http404
    attachment.file.delete(False)
    attachment.delete()
    return HttpResponse("[]")

def md5file(file):
    md5 = hashlib.md5()
    for chunk in file.chunks():
        md5.update(chunk)
    return md5.hexdigest()

@login_required
def add_attachment(request, id):
    def go():
        problem = get_or_none(Problem, id=id)
        if not problem:
            return {"success": False,
                    "error": u"존재하지 않는 문제입니다."}
        if not request.user.is_superuser and problem.user != request.user:
            return {"success": False,
                    "error": u"권한이 없습니다."}
        if request.method != "POST":
            return {"success": False,
                    "error": u"POST 접근하셔야 합니다."}
        file = request.FILES["file"]
        md5 = md5file(file)
        target_path = os.path.join("judge-attachments", md5, file.name)
        storage = DefaultStorage()
        storage.save(target_path, file)
        new_attachment = Attachment(problem=problem,
                                    file=target_path)
        new_attachment.save()
        return {"success": True}

    return HttpResponse(json.dumps(go()))


@login_required
def list_attachments(request, id):
    problem = get_object_or_404(Problem, id=id)
    if not request.user.is_superuser and problem.user != request.user:
        raise Http404
    data = [[attachment.id,
             os.path.basename(attachment.file.name),
             attachment.file.size,
             attachment.file.url]
            for attachment in Attachment.objects.filter(problem=problem)]
    ret = {"iTotalRecords": len(data),
           "sEcho": request.GET.get("sEcho", ""),
           "iTotalDisplayRecords": len(data),
           "aaData": data}
    return HttpResponse(json.dumps(ret))

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
        form.save(request.user, problem)
        return redirect(reverse("judge-submission-mine"))

    breadcrumbs = [(reverse("judge-index"), u"온라인 저지"),
            (reverse("judge-problem-read", kwargs={"slug":slug}),
                problem.slug),
            (reverse("judge-problem-submit", kwargs={"slug":slug}),
                u"제출하기")]
    return render(request, "problem/submit.html", {"form": form,
        "breadcrumbs": breadcrumbs, "problem": problem})
