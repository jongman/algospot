from django.http import HttpResponse
from django.shortcuts import render
from models import Page, PageRevision

def detail(request, slug):
    page = Page.objects.get(slug=slug)
    return render(request, "detail.html", {"page": page})
