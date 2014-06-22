# -*- coding: utf-8 -*-
from django.core.urlresolvers import reverse
from django.utils.html import escape
from django.contrib.auth.models import User

def link_to_user(username, display):
    link = reverse("user_username", kwargs={"username": username})
    return u'<a class="user" href="%s" title="%s">%s</a>' % (link,
                                                             username,
                                                             escape(display or username))
