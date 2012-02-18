# -*- coding: utf-8 -*-
from django.shortcuts import render

def index(request):
    return render(request, "calendar.html", {'title': u'알고스팟 캘린더'})

