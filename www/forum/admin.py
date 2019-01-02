from django.contrib import admin
from forum.models import Category, Post
from guardian.admin import GuardedModelAdmin

admin.site.register(Category, GuardedModelAdmin)
admin.site.register(Post, GuardedModelAdmin)
