# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404
from djangoutils import setup_paginator, profile
from models import Activity
from django.contrib.auth.models import User

@profile("newsfeed_stream")
def stream(request, page="1"):
    actions = Activity.objects.order_by("-timestamp")
    if not request.user.is_superuser:
        actions = actions.exclude(admin_only=True)

    return render(request, "newsfeed.html",
                  {"pagination": setup_paginator(actions, page, "newsfeed", {})})

def by_user(request, id, page="1"):
    user = get_object_or_404(User, id=id)
    actions = Activity.objects.filter(actor=user).order_by("-timestamp")
    if not request.user.is_superuser:
        actions = actions.exclude(admin_only=True)

    return render(request, "newsfeed.html",
                  {"pagination": setup_paginator(actions, page,
                                                 "newsfeed-byuser", {'id': id})})

def filter(request, id, type, page="1"):
    user = get_object_or_404(User, id=id)
    actions = Activity.objects.filter(actor=user, type=type).order_by("-timestamp")
    if not request.user.is_superuser:
        actions = actions.exclude(admin_only=True)
    pagination = setup_paginator(actions, page, "newsfeed-filter", {'id': id, 'type': type})
    return render(request, "newsfeed.html", {"pagination": pagination})
