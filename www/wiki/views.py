# -*- coding: utf-8 -*-
from diff_match_patch import diff_match_patch
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from base.decorators import authorization_required

from models import Page, PageRevision
from forms import EditForm
from utils import link_to_pages, slugify, unslugify, get_breadcrumbs, logger
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
        "summary": u"리비전 %s(으)로 복구." % id})
    assert form.is_valid()
    form.save(page, request.user)
    return redirect(reverse("wiki-detail", kwargs={"slug": page.slug}))

def history(request, slug):
    page = get_object_or_404(Page, slug=slug)

    revision_set = PageRevision.objects.filter(revision_for=page).order_by("-id")
    ids = [rev.id for rev in revision_set[:2]]
    revisions = revision_set.all()
    last, second_last = -1, -1
    if len(ids) >= 2:
        last, second_last = ids[0], ids[1]
        logger.info("last %s second_last %s", last, second_last)

    breadcrumbs = get_breadcrumbs(slug)
    breadcrumbs.append((reverse("wiki-history", kwargs={"slug": slug}), u"편집 내역"))
    return render(request, "history.html",
            {"slug": slug,
             "revisions": revisions,
             "title": page.title,
             "last_rev": last,
             "second_last_rev": second_last,
             "breadcrumbs": breadcrumbs})

def diff(request, id1=-1, id2=-1):
    rev1 = get_object_or_404(PageRevision, id=id1)
    rev2 = get_object_or_404(PageRevision, id=id2)
    slug = rev1.revision_for.slug
    title = rev1.revision_for.title

    dmp = diff_match_patch()
    diff = dmp.diff_compute(rev1.text, rev2.text, True, 2)
    breadcrumbs = get_breadcrumbs(slug)
    breadcrumbs.append((reverse("wiki-diff", kwargs={"id1": id1, "id2": id2}), 
        u"변화 내역"))
    return render(request, "diff.html",
            {"slug": slug,
             "title": title,
             "diff": diff,
             "rev1": id1,
             "rev2": id2,
             "rev1link": reverse("wiki-old", kwargs={"id": id1, "slug": slug}),
             "rev2link": reverse("wiki-old", kwargs={"id": id2, "slug": slug}),
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
