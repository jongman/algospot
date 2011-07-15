# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render, redirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponse
from djangoutils import get_or_none, setup_paginator
from models import Category, Post
from forms import WriteForm
from django.contrib.comments.models import Comment

def list(request, slug, page=1):
    category = get_object_or_404(Category, slug=slug)
    posts = Post.objects.filter(category=category).order_by("-id")
    breadcrumbs = [(reverse("forum-list",
        kwargs={"slug": category.slug, "page": 1}), category.name)]
    return render(request, "list.html", {"breadcrumbs": breadcrumbs,
        "category": category,
        "pagination": setup_paginator(posts, page, "forum-list",
            {"slug": category.slug})})

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

