from django.db import models
from django.contrib.auth.models import User

class Problem(models.Model):
    DRAFT, PENDING_REVIEW, HIDDEN, PUBLISHED = range(4)
    STATE_CHOICES = ((DRAFT, "DRAFT"),
            (PENDING_REVIEW, "PENDING REVIEW"),
            (HIDDEN, "HIDDEN"),
            (PUBLISHED, "PUBLISHED"))

    slug = models.SlugField(blank=True,max_length=100)
    updated_on = models.DateTimeField(auto_now=True)
    state = models.SmallIntegerField(default=DRAFT, choices=STATE_CHOICES)
    user = models.ForeignKey(User)
    source = models.TextField(max_length=100, blank=True)
    name = models.TextField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    input = models.TextField(blank=True)
    output = models.TextField(blank=True)
    sample_input = models.TextField(blank=True)
    sample_output = models.TextField(blank=True)
    note = models.TextField(blank=True)
    judge_module = models.TextField(blank=True,max_length=100)
    time_limit = models.PositiveIntegerField(default=10000)
    memory_limit = models.PositiveIntegerField(default=65536)
    submissions_count = models.IntegerField(default=0)
    accepted_count = models.IntegerField(default=0)

    def __unicode__(self):
        return self.slug

class Submission(models.Model):
    (RECEIVED, COMPILING, RUNNING, JUDGING, COMPILE_ERROR,
    OK, ACCEPTED, WRONG_ANSWER, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED,
    CANT_BE_JUDGED, REJUDGE_REQUESTED) = range(12)
    STATE_CHOICES = [
        (RECEIVED, "RECEIVED"),
        (COMPILING, "COMPILING"),
        (RUNNING, "RUNNING"),
        (JUDGING, "JUDGING"),
        (COMPILE_ERROR, "COMPILE ERROR"),
        (OK, "OK"),
        (ACCEPTED, "ACCEPTED"),
        (WRONG_ANSWER, "WRONG ANSWER"),
        (RUNTIME_ERROR, "RUNTIME ERROR"),
        (TIME_LIMIT_EXCEEDED, "TIME LIMIT EXCEEDED"),
        (CANT_BE_JUDGED, "CANT BE JUDGED"),
        (REJUDGE_REQUESTED, "REJUDGE REQUESTED")]

    submitted_on = models.DateTimeField(auto_now_add=True)
    problem = models.ForeignKey(Problem)
    is_public = models.BooleanField(default=True)
    user = models.ForeignKey(User)
    language = models.TextField(max_length=100)
    state = models.SmallIntegerField(default=RECEIVED, choices=STATE_CHOICES)
    length = models.IntegerField()
    source = models.TextField()
    message = models.TextField(blank=True, default="")
    time = models.IntegerField(null=True)
    memory = models.IntegerField(null=True)

class Attachment(models.Model):
    problem = models.ForeignKey(Problem)
    name = models.TextField(max_length=128)
    path = models.TextField(max_length=128)
    md5 = models.TextField(max_length=32)
    size = models.IntegerField()

