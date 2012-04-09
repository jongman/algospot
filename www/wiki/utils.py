# -*- coding: utf-8 -*-
from django.core.urlresolvers import reverse
from django.utils.html import escape
from models import Page
import logging
import re

logger = logging.getLogger("wiki")

def link_to_page(title, display):
    slug = slugify(title)
    if Page.objects.filter(slug=slug).count() == 0:
        return u'<a class="missing" href="%s">%s</a>' % (reverse("wiki-edit", kwargs={"slug": slug}), escape(display or title))
    return u'<a href="%s">%s</a>' % (reverse("wiki-detail", kwargs={"slug": slug}), escape(display or title))

def slugify(title):
    return re.sub(r'\s+', '_', title)

def unslugify(title):
    return re.sub(ur'[_\s]+', ' ', title)


