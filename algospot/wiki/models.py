from django.db import models
from django.contrib.auth.models import User

class PageRevision(models.Model):
    """Stores a specific revision of the page."""
    text = models.TextField()
    edit_summary = models.TextField(max_length=100)
    user = models.ForeignKey(User)
    created_on = models.DateTimeField(auto_now_add=True)
    revision_for = models.ForeignKey('Page')

class Page(models.Model):
    """Stores a wiki page."""
    title = models.TextField(unique=True, max_length=100)
    slug = models.SlugField(unique=True, max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)
    modified_on = models.DateTimeField(auto_now=True)
    current_revision = models.ForeignKey(PageRevision, related_name='main',
            blank=True, null=True)
