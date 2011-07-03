from django.conf.urls.defaults import patterns, include, url
from django.conf import settings
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^wiki/', include('www.wiki.urls')),
    url(r'^accounts/logout', 'django.contrib.auth.views.logout', 
        kwargs={'next_page': '/'}),
    url(r'^accounts/', include('registration.urls')),
    url(r'^user/', include('base.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^avatar/', include('avatar.urls')),

    # until we write the first page..
    url(r'^/?$', 'www.wiki.views.detail', kwargs={'slug': 'Main_Page'}),
)

if settings.DEBUG:
    # Serve all local files from MEDIA_ROOT below /media/
    urlpatterns += patterns('', 
            (r'^%s(?P<path>.*)$' % settings.MEDIA_URL.lstrip("/"),
                'django.views.static.serve', 
                {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),)
