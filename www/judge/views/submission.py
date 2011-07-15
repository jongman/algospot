# -*- coding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.core.urlresolvers import reverse
from djangoutils import setup_paginator
from ..models import Submission
from ..config import SUBMISSIONS_PER_PAGE, PAGINATOR_RANGE

@login_required
def mine(request, page=1):
    submissions = Submission.objects.filter(user=request.user)
    return submission_list(request, u"내가 제출한 답안들", submissions, page,
            "judge-submission-mine", {})

def recent(request, page=1):
    submissions = Submission.objects
    return submission_list(request, u"전체 답안들", submissions, page,
            "judge-submission-recent", {})


def submission_list(request, title, queryset, page, link_name, link_kwargs):
    breadcrumbs = [(reverse("judge-index"), u"온라인 저지"),
            (request.path, title)]
    return render(request, "submission/recent.html",
            {"title": title,
             "breadcrumbs": breadcrumbs,
             "pagination": setup_paginator(queryset, page, link_name,
                 link_kwargs)})

