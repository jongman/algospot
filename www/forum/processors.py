# -*- coding: utf-8 -*-

from models import Category
from utils import get_categories_for_user

def add_categories(request):
    return {"forum_categories": get_categories_for_user(request.user, 'read_post')}

