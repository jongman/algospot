from django.http import HttpResponse
from django.shortcuts import render

def detail(request, slug):
    return render(request, "detail.html", {"slug": slug})
