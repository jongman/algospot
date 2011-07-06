# -*- coding: utf-8 -*-

from models import Category

def add_categories(request):
    return {"forum_categories": Category.objects.all()}

