from django.contrib import admin
from models import Problem
from guardian.admin import GuardedModelAdmin

admin.site.register(Problem, GuardedModelAdmin)
