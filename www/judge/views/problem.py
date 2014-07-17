# -*- coding: utf-8 -*-
from diff_match_patch import diff_match_patch
from django.shortcuts import render, get_object_or_404, redirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse
from django.core.files.storage import DefaultStorage
from djangoutils import setup_paginator, get_or_none
from datetime import datetime
from django.contrib.auth.models import User
from django.db.models import Count
from guardian.core import ObjectPermissionChecker
from guardian.shortcuts import get_objects_for_user, get_users_with_perms, get_groups_with_perms
from base.decorators import authorization_required, admin_required
from newsfeed import publish
from ..models import Problem, Submission, Attachment, Solver, ProblemRevision
from ..forms import SubmitForm, AdminSubmitForm, ProblemEditForm, RestrictedProblemEditForm, ProblemRevisionEditForm
from rendertext import render_latex
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
    new_revision = ProblemRevision()
    new_revision.edit_summary = '문제 생성함.'
    new_revision.revision_for = new_problem
    new_revision.user = request.user
    new_revision.save()
    new_problem.slug = 'NEWPROB' + str(new_problem.id)
    new_problem.last_revision = new_revision
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
    checker = ObjectPermissionChecker(request.user)
    if not checker.has_perm('edit_problem', problem) and problem.user != request.user:
        raise Http404
    problem_revision = problem.last_revision

    form_class = (ProblemEditForm if request.user.is_superuser else
                  RestrictedProblemEditForm)
    form = form_class(data=request.POST or None, instance=problem)
    if request.method == "POST":
        revision_form = ProblemRevisionEditForm(data=request.POST or None, instance=ProblemRevision())
        if form.is_valid() and revision_form.is_valid():
            form.save()
            new_revision = revision_form.save(problem, request.user, commit=False)
            if new_revision.different_from(problem_revision):
                revision_form.save(problem, request.user)
            return redirect(reverse("judge-problem-read",
                kwargs={"slug": form.cleaned_data["slug"]}));
    revision_form = ProblemRevisionEditForm(data=request.POST or None, instance=problem_revision)
    return render(request, "problem/edit.html", {"problem": problem,
        "form": form, "revision_form": revision_form, "editable": checker.has_perm("edit_problem", problem)})

@login_required
def rejudge(request, id):
    problem = get_object_or_404(Problem, id=id)
    checker = ObjectPermissionChecker(request.user)
    if not checker.has_perm('edit_problem', problem) and problem.user != request.user:
        raise Http404
    submissions = Submission.objects.filter(problem=problem)
    for submission in submissions:
        submission.rejudge()
    return redirect(reverse('judge-submission-recent') +
                    '?problem=' + problem.slug)

@login_required
def delete_attachment(request, id):
    attachment = get_object_or_404(Attachment, id=id)
    problem = attachment.problem
    checker = ObjectPermissionChecker(request.user)
    if not checker.has_perm('edit_problem', problem) and problem.user != request.user:
        raise Http404
    old_id = attachment.id
    old_filename = attachment.file.name
    attachment.file.delete(False)
    attachment.delete()

    # 해당 오브젝트에 대해 아무 퍼미션이나 있으면 처리됨. 문제의 경우 PUBLISHED 일 때는 이 권한을 사용하지 않아서 안전하다
    visible_users = get_users_with_perms(problem, with_group_users=False)
    visible_groups = get_groups_with_perms(problem)

    publish("problem-attachment-delete-%s" % datetime.now().strftime('%s.%f'),
            "problem",
            "problem-attachment",
            actor=request.user,
            target=problem,
            timestamp=datetime.now(),
            visible_users=visible_users,
            visible_groups=visible_groups,
            verb=u"문제 {target}에서 첨부파일 %s 을 삭제했습니다." % os.path.basename(old_filename))
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
        checker = ObjectPermissionChecker(request.user)
        if not checker.has_perm('edit_problem', problem) and problem.user != request.user:
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

        # 해당 오브젝트에 대해 아무 퍼미션이나 있으면 처리됨. 문제의 경우 PUBLISHED 일 때는 이 권한을 사용하지 않아서 안전하다
        visible_users = get_users_with_perms(problem, with_group_users=False)
        visible_groups = get_groups_with_perms(problem)

        publish("problem-attachment-%s" % datetime.now().strftime('%s.%f'),
                "problem",
                "problem-attachment",
                actor=request.user,
                target=problem,
                timestamp=datetime.now(),
                visible_users=visible_users,
                visible_groups=visible_groups,
                verb=u"문제 {target}에 첨부파일 %s 을 추가했습니다." % file.name)
        return {"success": True}

    return HttpResponse(json.dumps(go()))


@login_required
def list_attachments(request, id):
    problem = get_object_or_404(Problem, id=id)
    checker = ObjectPermissionChecker(request.user)
    if not checker.has_perm('edit_problem', problem) and problem.user != request.user:
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
    readable_problems = get_objects_for_user(request.user, 'read_problem', Problem)
    my_problems = Problem.objects.filter(user=request.user)
    problems = (readable_problems | my_problems).exclude(state=Problem.PUBLISHED)
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


def list_slugs(request):
    problems = Problem.objects.filter(state=Problem.PUBLISHED)
    slugs = [p.slug for p in problems]
    return HttpResponse(json.dumps(slugs))


def goto(request):
    slug = request.GET.get('slug', '').upper()
    if Problem.objects.filter(slug=slug).exists():
        return redirect(reverse('judge-problem-read', kwargs={'slug': slug}))
    return render(request, 'problem/goto_fail.html', {'slug': slug})


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
        elif verdict == 'notyet':
            title = user.username + u': 시도하지 않은 문제들'
            problems = problems.exclude(solver__user=user)
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
    checker = ObjectPermissionChecker(request.user)
    if (problem.state != Problem.PUBLISHED and
        not checker.has_perm('read_problem', problem) and
        problem.user != request.user):
        raise Http404
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
                   'editable': checker.has_perm('edit_problem', problem),
                   'verdict_chart': verdict_chart,
                   'incorrects_chart': incorrect_tries_chart,
                   'pagination': pagination,
                  })

def read(request, slug):
    problem = get_object_or_404(Problem, slug=slug)
    checker = ObjectPermissionChecker(request.user)
    if (problem.state != Problem.PUBLISHED and
        not checker.has_perm('read_problem', problem) and
        problem.user != request.user):
        raise Http404
    return render(request, "problem/read.html", {"problem": problem, "revision": problem.last_revision, "editable": checker.has_perm('edit_problem', problem)})

@login_required
def latexify(request, slug):
    problem = get_object_or_404(Problem, slug=slug)
    checker = ObjectPermissionChecker(request.user)
    if (not checker.has_perm('read_problem', problem) and
        problem.user != request.user):
        raise Http404
    response = render(request, "problem/latexify.tex", {"problem": problem, "revision": problem.last_revision})
    response['Content-Type'] = 'text/plain; charset=UTF-8'
    return response

@login_required
def history(request, slug):
    problem = get_object_or_404(Problem, slug=slug)
    checker = ObjectPermissionChecker(request.user)
    if (not checker.has_perm('read_problem', problem) and
        problem.user != request.user):
        raise Http404
    revision_set = ProblemRevision.objects.filter(revision_for=problem).order_by("-id")
    ids = [rev.id for rev in revision_set[:2]]
    revisions = revision_set.all()
    last, second_last = -1, -1
    if len(ids) >= 2:
        last, second_last = ids[0], ids[1]
    return render(request, "problem/history.html",
                  {"problem": problem,
                   "editable": checker.has_perm('edit_problem', problem),
                   "revisions": revisions,
                   "last_rev": last,
                   "second_last_rev": second_last})

@login_required
def old(request, id, slug):
    problem = get_object_or_404(Problem, slug=slug)
    checker = ObjectPermissionChecker(request.user)
    if (not checker.has_perm('read_problem', problem) and
        problem.user != request.user):
        raise Http404
    revision = get_object_or_404(ProblemRevision, id=id)
    return render(request, "problem/old.html",
                  {"problem": problem,
                   "editable": checker.has_perm('edit_problem', problem),
                   "revision": revision})

@login_required
def revert(request, id, slug):
    problem = get_object_or_404(Problem, slug=slug)
    checker = ObjectPermissionChecker(request.user)
    if (not checker.has_perm('edit_problem', problem) and
        problem.user != request.user):
        raise Http404
    revision = ProblemRevision.objects.get(id=id)
    old_id = revision.id
    revision.id = None
    revision_form = ProblemRevisionEditForm(data=None, instance=revision)
    revision_form.save(problem, request.user, 
                       summary=u"리비전 %s로 복구." % old_id)
    return redirect(reverse("judge-problem-read", kwargs={"slug": problem.slug}))

@login_required
def diff(request, id1, id2):
    rev1 = get_object_or_404(ProblemRevision, id=id1)
    rev2 = get_object_or_404(ProblemRevision, id=id2)
    problem = rev1.revision_for
    checker = ObjectPermissionChecker(request.user)
    if (not checker.has_perm('read_problem', problem) and
        problem.user != request.user):
        raise Http404

    dmp = diff_match_patch()
    def differ(text1, text2):
        return text1 != text2 and dmp.diff_main(text1, text2) or None

    return render(request, "problem/diff.html",
                  {"problem": problem,
                   "editable": checker.has_perm('edit_problem', problem),
                   "rev1": rev1,
                   "rev2": rev2,
                   "rev1link": reverse("judge-problem-old", kwargs={"id": rev1.id, "slug": problem.slug}),
                   "rev2link": reverse("judge-problem-old", kwargs={"id": rev2.id, "slug": problem.slug}),
                   "description": differ(rev1.description, rev2.description),
                   "input": differ(rev1.input, rev2.input),
                   "output": differ(rev1.output, rev2.output),
                   "sample_input": differ(rev1.sample_input, rev2.sample_input),
                   "sample_output": differ(rev1.sample_output, rev2.sample_output),
                   "note": differ(rev1.note, rev2.note),
                   "differ": differ})

@login_required
def submit(request, slug):
    problem = get_object_or_404(Problem, slug=slug)
    checker = ObjectPermissionChecker(request.user)
    # read_problem permission owners and problem authors can opt in for nonpublic submissions.
    # nobody can submit public submissions to problems that are not published.
    if ((request.user == problem.user or checker.has_perm('read_problem', problem)) and
        problem.state == Problem.PUBLISHED):
        form = AdminSubmitForm(data=request.POST or None)
    else:
        form = SubmitForm(data=request.POST or None,
                          public=(problem.state == Problem.PUBLISHED))
    if request.method == "POST" and form.is_valid():
        form.save(request.user, problem)
        return redirect(reverse("judge-submission-recent"))

    return render(request, "problem/submit.html", {"form": form, "editable": checker.has_perm("edit_problem", problem),
        "problem": problem})
