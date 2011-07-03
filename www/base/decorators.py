# -*- coding: utf-8 -*-
from django.shortcuts import render

def authorization_required(func):
    def decorated(request, *args, **kwargs):
        user = request.user
        if not user.is_superuser and not user.get_profile().is_authorized():
            return render(request, "not_authorized.html")
        return func(request, *args, **kwargs)
    return decorated
