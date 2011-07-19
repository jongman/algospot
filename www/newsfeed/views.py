# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.core.urlresolvers import reverse
from djangoutils import setup_paginator, profile
from models import Activity

@profile("newsfeed_stream")
def stream(request, page="1"):
    actions = Activity.objects.order_by("-timestamp")
    breadcrumbs = [(reverse("newsfeed"), u"뉴스 피드")]

    return render(request, "newsfeed.html", {"breadcrumbs": breadcrumbs,
        "pagination": setup_paginator(actions, page, "newsfeed", {})})
