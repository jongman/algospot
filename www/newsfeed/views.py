# -*- coding: utf-8 -*-
from django.shortcuts import render, get_object_or_404
from djangoutils import setup_paginator, profile
from models import Activity
from utils import get_activities_for_user
from django.contrib.auth.models import User

@profile("newsfeed_stream")
def stream(request, page="1"):
    actions = get_activities_for_user(request.user).exclude(category='solved').order_by("-timestamp")
    print actions.query

    return render(request, "newsfeed.html",
                  {"pagination": setup_paginator(actions, page, "newsfeed", {})})

def by_user(request, id, page="1"):
    user = get_object_or_404(User, id=id)
    actions = get_activities_for_user(request.user).filter(actor=user).order_by("-timestamp")

    return render(request, "newsfeed.html",
                  {"pagination": setup_paginator(actions, page,
                                                 "newsfeed-byuser", {'id': id})})

def filter(request, id, type, page="1"):
    user = get_object_or_404(User, id=id)
    actions = get_activities_for_user(request.user).filter(actor=user, type=type).order_by("-timestamp")
    pagination = setup_paginator(actions, page, "newsfeed-filter", {'id': id, 'type': type})
    return render(request, "newsfeed.html", {"pagination": pagination})
