# -*- coding: utf-8 -*-
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from models import Page, PageRevision
from forms import EditForm
from utils import link_to_pages, slugify, unslugify, get_breadcrumbs
from djangoutils import get_or_none
from textutils import render_text

def old(request, id, slug):
    page = get_object_or_404(Page, slug=slug)
    revision = PageRevision.objects.get(id=id)
    breadcrumbs = get_breadcrumbs(slug)
    breadcrumbs.append((reverse("wiki-old", kwargs={"id": id, "slug": slug}),
        unicode(revision.created_on)))
    rendered = render_text(revision.text)
    rendered = link_to_pages(rendered)
    return render(request, "old.html",
            {"slug": slug,
             "title": page.title,
             "time": unicode(revision.created_on),
             "breadcrumbs": breadcrumbs,
             "modified": page.modified_on,
             "rendered_text": rendered})

def revert(request, id, slug):
    page = get_object_or_404(Page, slug=slug)
    revision = PageRevision.objects.get(id=id)
    text = revision.text
    form = EditForm({"text": revision.text, 
        "summary": "리비전 %s으로 복구."})
    assert form.is_valid()
    form.save(page, request.user)
    return redirect(reverse("wiki-detail", kwargs={"slug": page.slug}))

def history(request, slug):
    page = get_object_or_404(Page, slug=slug)
    revisions = PageRevision.objects.filter(revision_for=page).order_by("-id")
    breadcrumbs = get_breadcrumbs(slug)
    breadcrumbs.append((reverse("wiki-history", kwargs={"slug": slug}), u"편집 내역"))
    return render(request, "history.html",
            {"slug": slug,
             "revisions": revisions,
             "title": page.title,
             "breadcrumbs": breadcrumbs})

def detail(request, slug):
    page = get_object_or_404(Page, slug=slug)
    rendered = render_text(page.current_revision.text)
    rendered = link_to_pages(rendered)
    return render(request, "detail.html",
            {"slug": slug,
             "title": page.title,
             "breadcrumbs": get_breadcrumbs(slug),
             "modified": page.modified_on,
             "rendered_text": rendered})

def edit(request, slug):
    params = {"slug": slug, "breadcrumbs": get_breadcrumbs(slug)}
    page = get_or_none(Page, slug=slug)

    text = page.current_revision.text if page and page.current_revision else ""
    form = EditForm(data=request.POST or None,
            initial={"text": text})

    if request.method == "POST" and form.is_valid():
        if not page:
            page = Page(title=unslugify(slug), slug=slug)
            page.save()
        form.save(page, request.user)
        return redirect(reverse("wiki-detail", kwargs={"slug": page.slug}))

    params["form"] = form
    if page:
        params["action"] = "Edit"
        params["title"] = page.title
        params["modified"] = page.modified_on
        params["action"] = "Edit"
    else:
        params["title"] = unslugify(slug)
        params["modified"] = "NULL"
        params["action"] = "Create"

    return render(request, "edit.html", params)
