from django.urls import include, re_path
from django.conf import settings
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.views.static import serve as static_serve
from base import views as base_views
from base.feeds import PostFeed
from base.forms import AreYouAHumanFormView
try:
    from django_registration.views import RegistrationView
except ImportError:
    from registration.views import RegistrationView

admin.autodiscover()

urlpatterns = [
    re_path(r'^wiki/', include('wiki.urls')),
    re_path(r'^forum/', include('forum.urls')),
    re_path(r'^user/', include('base.urls')),
    re_path(r'^newsfeed/', include('newsfeed.urls')),
    re_path(r'^judge/', include('judge.urls')),
    re_path(r'^calendar/', base_views.calendar, name='calendar'),
    re_path(r'^feed/posts/', PostFeed(), name='postfeed'),
    re_path(r'^discussions/feed.rss', PostFeed()),
    re_path(r'^zbxe/rss', PostFeed()),

    re_path(r'^search/', include('haystack.urls')),

    re_path(r'^admin/', admin.site.urls),
    re_path(r'^accounts/logout', auth_views.LogoutView.as_view(next_page='/')),
    re_path(r'^avatar/', include('avatar.urls')),

    # we are overriding default comments app's deletion..
    re_path(r'^comments/delete/(?P<comment_id>.+)/', base_views.delete_comment,
        name="comment-delete-algospot"),

    # first page
    re_path(r'^$', base_views.index),

    # comments apps
    re_path(r'^comments/', include(settings.COMMENTS_URLCONF)),
]

if 'django_registration' in settings.INSTALLED_APPS:
    from avatar import views as avatar_views
    from django_registration.backends.one_step.views import (
        RegistrationView as OneStepRegistrationView,
    )
    urlpatterns += [
        # django-avatar 9 namespaces these names as avatar:change/add/delete.
        # Keep the historical global names used by Algospot's templates.
        re_path(r'^avatar/change/$', avatar_views.change,
                name='avatar_change'),
        re_path(r'^avatar/add/$', avatar_views.add, name='avatar_add'),
        re_path(r'^avatar/delete/$', avatar_views.delete,
                name='avatar_delete'),
        re_path(r'^accounts/', include('django.contrib.auth.urls')),
        re_path(
            r'^accounts/login/$', auth_views.LoginView.as_view(),
            name='auth_login'),
        re_path(
            r'^accounts/logout/$', auth_views.LogoutView.as_view(next_page='/'),
            name='auth_logout'),
        re_path(
            r'^accounts/password/reset/$',
            auth_views.PasswordResetView.as_view(),
            name='auth_password_reset'),
        re_path(
            r'^accounts/password/reset/done/$',
            auth_views.PasswordResetDoneView.as_view(),
            name='auth_password_reset_done'),
        re_path(
            r'^accounts/password/reset/confirm/(?P<uidb64>[^/]+)/(?P<token>[^/]+)/$',
            auth_views.PasswordResetConfirmView.as_view(),
            name='auth_password_reset_confirm'),
        re_path(
            r'^accounts/password/reset/complete/$',
            auth_views.PasswordResetCompleteView.as_view(),
            name='auth_password_reset_complete'),
        re_path(
            r'^accounts/register/$', OneStepRegistrationView.as_view(),
            name='registration_register'),
    ]

if settings.DEBUG:
    # Serve all local files from MEDIA_ROOT below /media/
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', static_serve,
            {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
    ]

if settings.USE_AYAH:
    urlpatterns += [
        re_path(r'^accounts/register/?$', AreYouAHumanFormView.as_view()),
    ]
    urlpatterns += [
        re_path(
            r'^accounts/',
            include(
                'django_registration.backends.activation.urls'
                if 'django_registration' in settings.INSTALLED_APPS
                else 'registration.backends.default.urls'
            ),
        ),
    ]
else:
    urlpatterns += [
        re_path(
            r'^accounts/',
            include(
                'django_registration.backends.one_step.urls'
                if 'django_registration' in settings.INSTALLED_APPS
                else 'registration.backends.simple.urls'
            ),
        ),
    ]
