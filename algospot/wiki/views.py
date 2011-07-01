from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.shortcuts import render, redirect
from models import Page, PageRevision
from forms import EditForm
from utils import link_to_pages
from djangoutils import get_or_none

def detail(request, slug):
    import markdown
    page = Page.objects.get(slug=slug)
    rendered = markdown.markdown(page.current_revision.text,
            extensions=["toc"])
    rendered = link_to_pages(rendered)
    return render(request, "detail.html",
            {"page": page,
             "rendered_text": rendered})

def edit(request, slug):
    page = get_or_none(Page, slug=slug)
    text = page.current_revision if page and page.current_revision else ""
    form = EditForm(data=request.POST or None,
            initial={"text": text})

    if request.method == "POST" and form.is_valid():
        form.save(page, request.user)
        return redirect(reverse("wiki-detail", kwargs={"slug": page.slug}))

    return render(request, "edit.html", {"page": page, "form": form})
