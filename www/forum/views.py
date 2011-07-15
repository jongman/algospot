# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render, redirect
from django.core.urlresolvers import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponse
from djangoutils import get_or_none
from models import Category, Post
from forms import WriteForm
from django.contrib.comments.models import Comment
from config import ITEMS_PER_PAGE, PAGINATOR_RANGE

def list(request, slug, page):
    category = get_object_or_404(Category, slug=slug)
    posts = Post.objects.filter(category=category).order_by("-id")
    paginator = Paginator(posts, ITEMS_PER_PAGE)
    try:
        page = paginator.page(page)
    except PageNotAnInteger:
        page = paginator.page(1)
    except EmptyPage:
        page = paginator.page(paginator.num_pages)
    breadcrumbs = [
            (reverse("forum-list", 
                kwargs={"slug": category.slug, "page": 1}), category.name)]
    page_lo = max(1, page.number - PAGINATOR_RANGE)
    page_hi = min(paginator.num_pages, page.number + PAGINATOR_RANGE)
    return render(request, "list.html", {"breadcrumbs": breadcrumbs,
        "page": page, "category": category, "page_lo": page_lo,
        "page_hi": page_hi, "page_nav_range": range(page_lo, page_hi+1)})

def read(request, id):
    post = get_object_or_404(Post, id=id)
    category = post.category
    breadcrumbs = [
            (reverse("forum-list", 
                kwargs={"slug": category.slug, "page": 1}), category.name),
            (reverse("forum-read", kwargs={"id": id}), post.title)]
    return render(request, "read.html", {"breadcrumbs": breadcrumbs, 
        "post": post, "category": category})

@login_required
def write(request, slug, id):
    initial_data = {}
    action = u"글 쓰기"
    if slug != None:
        category = get_object_or_404(Category, slug=slug)
        initial_data["category"] = category.id
    if id != None:
        action = u"글 편집하기"
        post = get_object_or_404(Post, id=id)
        if not request.user.is_superuser and request.user != post.user:
            return HttpForbidden("operation is forbidden.")
        initial_data["title"] = post.title
        initial_data["text"] = post.text
        initial_data["category"] = post.category.id
        category = post.category
    breadcrumbs = [(reverse("forum-list",
        kwargs={"slug": category.slug, "page": 1}),
        category.name)]
    if id != None:
        breadcrumbs.append((reverse("forum-read", kwargs={"id": id}),
            post.title))
    breadcrumbs.append((None, action))

    form = WriteForm(data=request.POST or None, initial=initial_data)
    if request.method == "POST" and form.is_valid():
        id = form.save(request.user, id)
        return redirect(reverse("forum-read", kwargs={"id": id}))
    return render(request, "write.html", {"form": form, "action": action,
        "breadcrumbs": breadcrumbs, "category": category})

def delete(request, id):
    post = get_object_or_404(Post, id=id)
    if not request.user.is_superuser and request.user != post.user:
        return HttpForbidden("operation is forbidden.")
    category = post.category
    breadcrumbs = [
            (reverse("forum-list", 
                kwargs={"slug": category.slug, "page": 1}), category.name),
            (reverse("forum-read", kwargs={"id": id}), post.title),
            (reverse("forum-delete", kwargs={"id": id}), u"삭제")]
    # Delete on POST
    if request.method == 'POST':
        # delete all comments
        Comment.objects.filter(object_pk=post.id,
                content_type=ContentType.objects.get_for_model(Post)).delete()
        post.delete()
        return redirect(reverse("forum-list", kwargs={"slug": category.slug,
            "page": 1}))
    return render(request, "delete.html", {"breadcrumbs": breadcrumbs, 
        "post": post, "category": category})

