from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from djangoutils import get_or_none
from models import Category, Post
#from forms import EditForm

def list(request, slug, page):
    pass

def read(request, id):
    pass

@login_required
def write(request, slug, id):
    return HttpResponse("ouch")

def delete(request, id):
    pass

