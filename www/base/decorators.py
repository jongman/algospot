# -*- coding: utf-8 -*-
from django.shortcuts import render
from models import USER_AUTHORIZATION_LIMIT

def authorization_required(func):
    def decorated(request, *args, **kwargs):
        user = request.user
        if not user.is_superuser and not user.get_profile().is_authorized():
            return render(request, "not_authorized.html", 
                    {"limit": USER_AUTHORIZATION_LIMIT, 
                        "solved": user.get_profile().solved_problems})
        return func(request, *args, **kwargs)
    return decorated
