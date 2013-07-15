# -*- coding: utf-8 -*-
from models import Category, Post
from django.contrib.auth.models import User
from guardian.conf import settings
from guardian.shortcuts import get_objects_for_user

def get_categories_for_user(request_user, perm):
    user = (request_user.is_anonymous() and User.objects.get(pk=settings.ANONYMOUS_USER_ID) or request_user)
    categories = get_objects_for_user(user, perm, Category)
    return categories


def get_posts_for_user(request_user, perm):
    posts = Post.objects.filter(category__in=get_categories_for_user(request_user, perm))
    return posts
