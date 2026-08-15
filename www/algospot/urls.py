from django.conf.urls import include, url
from django.conf import settings
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.views.static import serve as static_serve
from base import views as base_views
from base.feeds import PostFeed
from base.forms import AreYouAHumanFormView
from registration.views import RegistrationView

admin.autodiscover()

urlpatterns = [
    url(r'^wiki/', include('wiki.urls')),
    url(r'^forum/', include('forum.urls')),
    url(r'^user/', include('base.urls')),
    url(r'^newsfeed/', include('newsfeed.urls')),
    url(r'^judge/', include('judge.urls')),
    url(r'^calendar/', base_views.calendar, name='calendar'),
    url(r'^feed/posts/', PostFeed(), name='postfeed'),
    url(r'^discussions/feed.rss', PostFeed()),
    url(r'^zbxe/rss', PostFeed()),

    url(r'^search/', include('haystack.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/logout', auth_views.logout,
        kwargs={'next_page': '/'}),
    url(r'^avatar/', include('avatar.urls')),

    # we are overriding default comments app's deletion..
    url(r'^comments/delete/(?P<comment_id>.+)/', base_views.delete_comment,
        name="comment-delete-algospot"),

    # first page
    url(r'^$', base_views.index),

    # comments apps
    url(r'^comments/', include(settings.COMMENTS_URLCONF)),
]

if settings.DEBUG:
    # Serve all local files from MEDIA_ROOT below /media/
    urlpatterns += [
        url(r'^media/(?P<path>.*)$', static_serve,
            {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
    ]

if settings.USE_AYAH:
    urlpatterns += [
        url(r'^accounts/register/?$', AreYouAHumanFormView.as_view()),
    ]
    urlpatterns += [
        url(r'^accounts/', include('registration.backends.default.urls')),
    ]
else:
    urlpatterns += [
        url(r'^accounts/', include('registration.backends.simple.urls')),
    ]
