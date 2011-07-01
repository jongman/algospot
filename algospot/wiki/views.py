from django.http import HttpResponse
from django.shortcuts import render
from models import Page, PageRevision
from forms import EditForm

def detail(request, slug):
    import markdown
    page = Page.objects.get(slug=slug)
    rendered = markdown.markdown(page.current_revision.text)
    return render(request, "detail.html",
            {"page": page,
             "rendered_text": rendered})

def edit(request, slug):
    page = Page.objects.get(slug=slug)
    form = EditForm({"text": page.current_revision.text})
    return render(request, "edit.html", {"page": page, "form": form})
