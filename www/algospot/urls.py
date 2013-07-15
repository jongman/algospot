from django.conf.urls.defaults import patterns, include, url
from django.conf import settings
from django.contrib import admin
from base.feeds import PostFeed
from registration.views import RegistrationView

admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^wiki/', include('wiki.urls')),
    url(r'^forum/', include('forum.urls')),
    url(r'^user/', include('base.urls')),
    url(r'^newsfeed/', include('newsfeed.urls')),
    url(r'^judge/', include('judge.urls')),
    url(r'^calendar/', 'base.views.calendar', name='calendar'),
    url(r'^feed/posts/', PostFeed(), name='postfeed'),
    url(r'^discussions/feed.rss', PostFeed()),
    url(r'^zbxe/rss', PostFeed()),

    url(r'^search/', include('haystack.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/logout', 'django.contrib.auth.views.logout',
        kwargs={'next_page': '/'}),
    url(r'^avatar/', include('avatar.urls')),

    # we are overriding default comments app's deletion..
    url(r'^comments/delete/(?P<comment_id>.+)/', 'base.views.delete_comment',
        name="comment-delete-algospot"),

    # first page
    url(r'^/?$', 'base.views.index'),

    # comments apps
    url(r'^comments/', include('django.contrib.comments.urls')),
)

if settings.DEBUG:
    # Serve all local files from MEDIA_ROOT below /media/
    urlpatterns += patterns(
        '',
        (r'^media/(?P<path>.*)$', 'django.views.static.serve',
         {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),)

if settings.USE_AYAH:
    urlpatterns += patterns(
        '',
        url(r'^accounts/register/?$', base.forms.AreYouAHumanFormView.as_view()),
    )

urlpatterns += patterns(
    '',
    url(r'^accounts/', include('registration.backends.default.urls')),
)
