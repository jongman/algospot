from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.shortcuts import render, redirect
from models import Page, PageRevision
from forms import EditForm
from utils import link_to_pages, slugify, unslugify, get_breadcrumbs
from djangoutils import get_or_none

def detail(request, slug):
    import markdown
    page = Page.objects.get(slug=slug)
    rendered = markdown.markdown(page.current_revision.text,
            extensions=["toc"])
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
