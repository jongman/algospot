from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    """Stores a post category."""
    name = models.TextField()
    slug = models.TextField()

    def __unicode__(self):
        return self.name

class Post(models.Model):
    """Stores a forum post."""
    title = models.TextField(max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, null=False)
    text = models.TextField()

    def __unicode__(self):
        return self.title
