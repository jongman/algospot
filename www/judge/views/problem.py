# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404, redirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse
from django.core.files.storage import DefaultStorage
from djangoutils import setup_paginator, get_or_none
from django.contrib.auth.models import User
from django.db.models import Count
from base.decorators import authorization_required
from ..models import Problem, Submission, Attachment, Solver
from ..forms import SubmitForm, AdminSubmitForm, ProblemEditForm, RestrictedProblemEditForm
import json
import os
import hashlib
import uuid
import urllib

@login_required
def new(request):
    new_problem = Problem(user=request.user, name=u"(새 문제)",
                          slug=str(uuid.uuid4()))
    new_problem.save()
    new_problem.slug = 'NEWPROB' + str(new_problem.id)
    new_problem.save()
    return redirect(reverse('judge-problem-edit',
                            kwargs={'id': new_problem.id}))

@login_required
def delete(request, id):
    problem = get_object_or_404(Problem, id=id)
    if not request.user.is_superuser and problem.user != request.user:
        raise Http404
    Solver.objects.filter(problem=problem).delete()
    Submission.objects.filter(problem=problem).delete()
    for attach in Attachment.objects.filter(problem=problem):
        attach.file.delete(False)
        attach.delete()
    del problem.tags
    problem.save()
    problem.delete()
    return redirect(reverse('judge-problem-mine'))

@login_required
def edit(request, id):
    problem = get_object_or_404(Problem, id=id)
    if not request.user.is_superuser and problem.user != request.user:
        raise Http404
    form_class = (ProblemEditForm if request.user.is_superuser else
                  RestrictedProblemEditForm)
    form = form_class(data=request.POST or None, instance=problem)
    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect(reverse("judge-problem-read",
            kwargs={"slug": form.cleaned_data["slug"]}));
    return render(request, "problem/edit.html", {"problem": problem,
        "form": form})

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

@login_required
@authorization_required
def my_problems(request, page=1):
    problems = Problem.objects.exclude(state=Problem.PUBLISHED)
    if not request.user.is_superuser:
        title = u'내가 낸 문제들'
        problems = problems.filter(user=request.user)
    else:
        title = u'준비 중인 문제들'

    order_by = request.GET.get("order_by", 'slug')
    problems = problems.annotate(Count('solver'))
    if order_by.lstrip('-') in ('slug', 'name', 'state'):
        problems = problems.order_by(order_by)
    else:
        assert order_by.endswith('user')
        problems = problems.order_by(order_by + '__username')

    return render(request, 'problem/mine.html',
                  {'title': title,
                   'pagination': setup_paginator(problems, page,
                                                 'judge-problem-mine', {})})

def list(request, page=1):
    use_filter = True
    filters = {}
    title_options = []
    problems = Problem.objects.filter(state=Problem.PUBLISHED)
    if request.GET.get("tag"):
        tag = filters["tag"] = request.GET["tag"]
        problems = Problem.tagged.with_all([tag])
        title_options.append(tag)
    if request.GET.get("source"):
        source = filters["source"] = request.GET["source"]
        problems = problems.filter(source=source)
        title_options.append(source)
    if request.GET.get("author"):
        filters["author"] = request.GET["author"]
        author = get_object_or_404(User, username=filters["author"])
        problems = problems.filter(user=author)
        title_options.append(author.username)
    if title_options:
        title = u"문제 목록: " + u", ".join(title_options)
    else:
        title = u"문제 목록 보기"

    if request.GET.get('user_tried'):
        use_filter = False
        id = request.GET.get('user_tried')
        user = get_object_or_404(User, id=id)
        verdict = request.GET.get('verdict')
        if verdict == 'solved':
            title = user.username + u': 해결한 문제들'
            problems = problems.filter(solver__user=user, solver__solved=True)
        elif verdict == 'failed':
            title = user.username + u': 실패한 문제들'
            problems = problems.filter(solver__user=user, solver__solved=False)
        else:
            title = user.username + u': 시도한 문제들'
            problems = problems.filter(solver__user=user)

    order_by = request.GET.get('order_by', 'slug')
    if order_by.endswith('ratio'):
        ratio_def = ('cast("judge_problem"."accepted_count" as float) / '
                     'greatest(1, "judge_problem"."submissions_count")')
        problems = problems.extra(select={'ratio': ratio_def})
    if order_by.endswith('user'):
        problems = problems.order_by(order_by + '__username')
    else:
        problems = problems.order_by(order_by)

    # options = {}
    # TODO: 카테고리별 문제 보기
    # TODO: 난이도 순으로 정렬하기
    sources = sorted([entry["source"] for entry in
                      Problem.objects.values("source").distinct()])
    authors = sorted([User.objects.get(id=entry["user"]).username
                      for entry in Problem.objects.values("user").distinct()])
    tags = sorted([tag.name for tag in Problem.tags.all()])

    get_params = '&'.join(k + '=' + v for k, v in request.GET.items())
    return render(request, "problem/list.html",
                  {"title": title,
                   "sources": sources,
                   "authors": authors,
                   "tags": tags,
                   "use_filter": use_filter,
                   "filters": filters,
                   "get_params": get_params,
                   "pagination": setup_paginator(problems, page,
                                                 "judge-problem-list",
                                                 {},
                                                 request.GET)})

def stat(request, slug, page=1):
    problem = get_object_or_404(Problem, slug=slug)
    submissions = Submission.objects.filter(problem=problem)
    verdict_chart = Submission.get_verdict_distribution_graph(submissions)
    incorrect_tries_chart = Solver.get_incorrect_tries_chart(problem)

    solvers = Solver.objects.filter(problem=problem, solved=True)
    order_by = request.GET.get('order_by', 'shortest')
    if order_by.endswith('fastest'):
        solvers = solvers.order_by(order_by + '_submission__time')
    elif order_by.endswith('shortest'):
        solvers = solvers.order_by(order_by + '_submission__length')
    else:
        solvers = solvers.order_by(order_by)
    pagination = setup_paginator(solvers, page, 'judge-problem-stat',
                                 {'slug': slug}, request.GET)
    title = problem.slug + u': 해결한 사람들'
    return render(request, "problem/stat.html",
                  {'title': title,
                   'problem': problem,
                   'verdict_chart': verdict_chart,
                   'incorrects_chart': incorrect_tries_chart,
                   'pagination': pagination,
                  })

def read(request, slug):
    problem = get_object_or_404(Problem, slug=slug)
    return render(request, "problem/read.html", {"problem": problem})

def submit(request, slug):
    problem = get_object_or_404(Problem, slug=slug)
    # superusers and problem authors can opt in for nonpublic submissions.
    # nobody can submit public submissions to problems that are not published.
    if ((request.user == problem.user or request.user.is_superuser) and
        problem.state == Problem.PUBLISHED):
        form = AdminSubmitForm(data=request.POST or None)
    else:
        form = SubmitForm(data=request.POST or None,
                          public=(problem.state == Problem.PUBLISHED))
    if request.method == "POST" and form.is_valid():
        form.save(request.user, problem)
        return redirect(reverse("judge-submission-recent"))

    return render(request, "problem/submit.html", {"form": form,
        "problem": problem})
