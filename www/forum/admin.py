from django.contrib import admin
from forum.models import Category
from guardian.admin import GuardedModelAdmin

admin.site.register(Category, GuardedModelAdmin)
