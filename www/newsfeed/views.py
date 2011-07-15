# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.urlresolvers import reverse
from actstream.models import Action
from djangoutils import profile, setup_paginator

@profile("newsfeed_stream")
def stream(request, page="1"):
    actions = Action.objects.order_by("-timestamp")
    breadcrumbs = [(reverse("newsfeed"), u"뉴스 피드")]

    return render(request, "newsfeed.html", {"breadcrumbs": breadcrumbs,
        "pagination": setup_paginator(actions, page, "newsfeed", {})})
