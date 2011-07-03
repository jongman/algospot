from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """Stores additional information about users."""
    user = models.OneToOneField(User)
    posts = models.IntegerField(null=False, default=0)
    submissions = models.IntegerField(null=False, default=0)
    solved_problems = models.IntegerField(null=False, default=0)
