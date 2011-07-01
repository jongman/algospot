from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^wiki/', include('algospot.wiki.urls')),
    # Examples:
    # url(r'^$', 'algospot.views.home', name='home'),
    # url(r'^algospot/', include('algospot.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
