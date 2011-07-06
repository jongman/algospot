from django.conf.urls.defaults import patterns, include, url
from django.conf import settings
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^wiki/', include('www.wiki.urls')),
    url(r'^user/', include('base.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/logout', 'django.contrib.auth.views.logout', 
        kwargs={'next_page': '/'}),
    url(r'^accounts/', include('registration.urls')),
    url(r'^avatar/', include('avatar.urls')),

    # we are overriding default comments app's deletion.. 
    url(r'^comments/delete/(?P<comment_id>.+)/', 'www.base.views.delete_comment',
        name="comment-delete-algospot"),

    # until we write the first page..
    url(r'^/?$', 'www.wiki.views.detail', kwargs={'slug': 'Main_Page'}),

    # comments apps
    url(r'^comments/', include('django.contrib.comments.urls')),
)

if settings.DEBUG:
    # Serve all local files from MEDIA_ROOT below /media/
    urlpatterns += patterns('', 
            (r'^%s(?P<path>.*)$' % settings.MEDIA_URL.lstrip("/"),
                'django.views.static.serve', 
                {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),)
