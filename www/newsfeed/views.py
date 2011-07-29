# -*- coding: utf-8 -*-
from django.shortcuts import render
from djangoutils import setup_paginator, profile
from models import Activity

@profile("newsfeed_stream")
def stream(request, page="1"):
    actions = Activity.objects.order_by("-timestamp")

    return render(request, "newsfeed.html",
                  {"pagination": setup_paginator(actions, page, "newsfeed", {})})
