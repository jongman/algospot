from django.conf.urls.defaults import patterns, include, url
from django.conf import settings
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^wiki/', include('algospot.wiki.urls')),
    url(r'^accounts/logout', 'django.contrib.auth.views.logout', 
        kwargs={'next_page': '/'}),
    url(r'^accounts/', include('registration.urls')),
    url(r'^user/', include('base.urls')),
    # Examples:
    # url(r'^$', 'algospot.views.home', name='home'),
    # url(r'^algospot/', include('algospot.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^avatar/', include('avatar.urls')),
)

if settings.DEBUG:
    # Serve all local files from MEDIA_ROOT below /media/
    urlpatterns += patterns('', 
            (r'^%s(?P<path>.*)$' % settings.MEDIA_URL.lstrip("/"),
                'django.views.static.serve', 
                {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),)
