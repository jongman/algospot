from django.http import HttpResponse

def detail(request, slug):
    return HttpResponse("Hello, oh wow it worked")
