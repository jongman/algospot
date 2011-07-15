# -*- coding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from ..models import Submission
from ..config import SUBMISSIONS_PER_PAGE, PAGINATOR_RANGE

@login_required
def mine(request, page=1):
    submissions = Submission.objects.filter(user=request.user)
    return submission_list(request, submissions, page)

def submission_list(request, queryset, page):
    return ""



