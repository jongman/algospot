# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings

def authorization_required(func):
    def decorated(request, *args, **kwargs):
        user = request.user
        if not user.is_superuser and not user.get_profile().is_authorized():
            return render(request, "not_authorized.html",
                          {"limit": settings.USER_AUTHORIZATION_LIMIT,
                           "limit_days": settings.USER_AUTHORIZATION_LIMIT_DAYS,
                           "solved": user.get_profile().solved_problems})
        return func(request, *args, **kwargs)
    return decorated

def admin_required(func):
    def decorated(request, *args, **kwargs):
        user = request.user
        if not user.is_superuser:
            return HttpResponse('Unauthorized', status=401)
        return func(request, *args, **kwargs)
    return decorated
