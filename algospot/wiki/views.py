from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.shortcuts import render, redirect
from models import Page, PageRevision
from forms import EditForm

def detail(request, slug):
    import markdown
    page = Page.objects.get(slug=slug)
    rendered = markdown.markdown(page.current_revision.text,
            extensions=["toc"])
    return render(request, "detail.html",
            {"page": page,
             "rendered_text": rendered})

def edit(request, slug):
    page = Page.objects.get(slug=slug)
    form = EditForm(data=request.POST or None,
            initial={"text": page.current_revision.text})

    if request.method == "POST" and form.is_valid():
        form.save(page, request.user)
        return redirect(reverse("wiki-detail", kwargs={"slug": page.slug}))

    return render(request, "edit.html", {"page": page, "form": form})
