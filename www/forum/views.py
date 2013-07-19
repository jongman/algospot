# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render, redirect
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponseForbidden
from djangoutils import setup_paginator
from models import Category, Post
from forms import WriteForm
from utils import get_posts_for_user, get_categories_for_user
from django.contrib.comments.models import Comment
from django.contrib.auth.models import User
from guardian.core import ObjectPermissionChecker

def list(request, slug, page=1):
    checker = ObjectPermissionChecker(request.user)
    category = get_object_or_404(Category, slug=slug)
    if not checker.has_perm('read_post', category):
        return HttpResponseForbidden("Restricted category")
    posts = Post.objects.filter(category=category).order_by("-id")
    return render(request, "list.html",
                  {"write_at": category.slug if checker.has_perm('write_post', category) else None,
                   "title": category.name,
                   "category": category,
                   "pagination": setup_paginator(posts, page, "forum-list",
                                                 {"slug": category.slug})})

def all(request, page=1):
    posts = get_posts_for_user(request.user, 'forum.read_post').order_by("-id")
    write_category = get_object_or_404(Category, slug='free')
    return render(request, "list.html",
                  {"show_category": True,
                   'write_at': write_category.slug,
                   "title": u"모든 글 보기",
                   "pagination": setup_paginator(posts, page, "forum-all", {})})

def by_user(request, id, page=1):
    user = get_object_or_404(User, id=id)
    posts = get_posts_for_user(request.user, 'forum.read_post').filter(user=user).order_by("-id")
    return render(request, "by_user.html",
                  {"filter_user": user,
                   "pagination": setup_paginator(posts, page, "forum-byuser", {"id": user.id})})

def read(request, id):
    post = get_object_or_404(Post, id=id)
    category = post.category
    checker = ObjectPermissionChecker(request.user)
    if not checker.has_perm('read_post', category):
        return HttpResponseForbidden("Restricted post")
    return render(request, "read.html", {"post": post, "category": category})

@login_required
def write(request, slug, id):
    initial_data = {}
    categories = get_categories_for_user(request.user, 'forum.write_post')
    action = u"글 쓰기"
    if slug != None:
        category = get_object_or_404(Category, slug=slug)
        initial_data["category"] = category.id
    if id != None:
        action = u"글 편집하기"
        post = get_object_or_404(Post, id=id)
        if not request.user.is_superuser and request.user != post.user:
            return HttpResponseForbidden("Operation is forbidden.")
        category = post.category
        categories = categories | Category.objects.filter(id=category.id) # nah
        form = WriteForm(categories, data=request.POST or None, instance=post)
    else:
        if not categories.filter(id=category.id).exists():
            return HttpResponseForbidden("Operation is forbidden.")
        form = WriteForm(categories, data=request.POST or None, initial=initial_data)

    if request.method == "POST" and form.is_valid():
        post = form.save(commit=False)
        if id == None: post.user = request.user
        post.save()
        return redirect(reverse("forum-read", kwargs={"id": post.id}))
    return render(request, "write.html", {"form": form, "action": action,
                                          "category": category, "categories": categories})

def delete(request, id):
    post = get_object_or_404(Post, id=id)
    if not request.user.is_superuser and request.user != post.user:
        return HttpResponseForbidden("operation is forbidden.")
    category = post.category
    # Delete on POST
    if request.method == 'POST':
        # delete all comments
        Comment.objects.filter(object_pk=post.id,
                content_type=ContentType.objects.get_for_model(Post)).delete()
        post.delete()
        return redirect(reverse("forum-list",
                                kwargs={"slug": category.slug, "page": 1}))
    return render(request, "delete.html", {"post": post, "category": category})

