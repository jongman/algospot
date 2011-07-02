# -*- coding: utf-8 -*-
from django.core.urlresolvers import reverse
from models import Page
import re
import logging

logger = logging.getLogger("wiki")

link_pattern = re.compile("\[\[([^\]]+)\]\]")

def slugify(title):
    return re.sub(r'\s+', '_', title)

def unslugify(title):
    return re.sub(ur'[_\s]+', ' ', title)

def get_breadcrumbs(slug):
    parts = slug.split("/")
    s = ""
    ret = []
    for part in slug.split("/"):
        if s: s += "/"
        s += part
        ret.append((reverse("wiki-detail", kwargs={"slug": s}),
            unslugify(part)))
    return ret

def link_to_pages(rendered):
    def replace(match):
        title = match.group(1)
        slug = slugify(title)
        if Page.objects.filter(slug=slug).count() == 0:
            return u'<a class="missing" href="%s">%s</a>' % (
                reverse("wiki-edit", kwargs={"slug": slug}),
                title)
            link_class = "missing"
        return u'<a href="%s">%s</a>' % (
                reverse("wiki-detail", kwargs={"slug": slug}),
                title)

    return link_pattern.sub(replace, rendered)


