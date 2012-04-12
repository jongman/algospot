# -*- coding: utf-8 -*-
import hotshot
import os
import urllib
import time
import re
import markdown
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter
from django.conf import settings
from django.template.loader import render_to_string
from django.core.urlresolvers import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.utils.html import urlize

# TODO: move this module to base app

def get_or_none(model, **kwargs):
    try:
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        return None

def get_query(params):
    if not params: return ""
    return "?" + "&".join(["%s=%s" % (key,
                                      urllib.quote(val.encode("utf-8")))
                           for key, val in params.iteritems()])

class Pagination(object):
    def __init__(self, paginator, page, link_name, link_kwargs, get_params):
        self.paginator = paginator
        self.page = page
        self.link_name = link_name
        self.link_kwargs = dict(link_kwargs)
        self.get_params = get_query(get_params)

    def link_with_page(self, page):
        self.link_kwargs["page"] = page
        return (reverse(self.link_name, kwargs=self.link_kwargs) +
                self.get_params)

    def render(self):
        num_pages = self.paginator.num_pages
        lo = max(1, self.page.number - settings.PAGINATOR_RANGE)
        hi = min(num_pages, self.page.number + settings.PAGINATOR_RANGE)
        links = [(page_no, self.link_with_page(page_no), page_no == self.page.number)
                 for page_no in xrange(lo, hi+1)]
        first = ({"link": self.link_with_page(1), "label": 1} if lo != 1 else None)
        last = ({"link": self.link_with_page(num_pages), "label": num_pages}
                if hi < num_pages else None)
        return render_to_string("pagination.html",
                                {"links": links, "first": first, "last": last})

    def __unicode__(self):
        return self.render()


def setup_paginator(objects, page, link_name, link_kwargs, get_params={}):
    paginator = Paginator(objects, settings.ITEMS_PER_PAGE)
    try:
        page = paginator.page(page)
    except PageNotAnInteger:
        page = paginator.page(1)
    except EmptyPage:
        page = paginator.page(paginator.num_pages)
    return Pagination(paginator, page, link_name, link_kwargs, get_params)

try:
    PROFILE_LOG_BASE = settings.PROFILE_LOG_BASE
except:
    PROFILE_LOG_BASE = None


def profile(log_file):
    """Profile some callable.

    This decorator uses the hotshot profiler to profile some callable (like
    a view function or method) and dumps the profile data somewhere sensible
    for later processing and examination.

    It takes one argument, the profile log name. If it's a relative path, it
    places it under the PROFILE_LOG_BASE. It also inserts a time stamp into the
    file name, such that 'my_view.prof' become 'my_view-20100211T170321.prof',
    where the time stamp is in UTC. This makes it easy to run and compare
    multiple trials.
    """

    if not PROFILE_LOG_BASE: return lambda f: f

    if not os.path.isabs(log_file):
        log_file = os.path.join(PROFILE_LOG_BASE, log_file)

    def _outer(f):
        def _inner(*args, **kwargs):
            # Add a timestamp to the profile output when the callable
            # is actually called.
            (base, ext) = os.path.splitext(log_file)
            base = base + "-" + time.strftime("%Y%m%dT%H%M%S", time.gmtime())
            final_log_file = base + ext

            prof = hotshot.Profile(final_log_file)
            try:
                ret = prof.runcall(f, *args, **kwargs)
            finally:
                prof.close()
            return ret

        return _inner
    return _outer

code_pattern = re.compile(r'<code lang=([^>]+)>(.+?)</code>', re.DOTALL)
def highlight_code_section(text):
    def proc(match):
        lang = match.group(1).strip('"\'')
        lexer = get_lexer_by_name(lang, stripall=True)
        formatter = HtmlFormatter(style="colorful")
        code = match.group(2).replace("\t", "  ")
        highlighted = highlight(code, lexer, formatter)
        return highlighted.replace("\n", "<br/>")

    return code_pattern.sub(proc, text)

link_pattern = re.compile("\[\[(?:([^|\]]+)\|)?(?:([^:\]]+):)?([^\]]+)\]\]")
def link_to_entities(rendered):
    def replace(match):
        display = match.group(1)
        namespace = match.group(2) or ''
        title = match.group(3)
        if namespace == 'problem':
            try:
                from judge.utils import link_to_problem
                return link_to_problem(title, display)
            except:
                pass
        elif namespace == '':
            try:
                from wiki.utils import link_to_page
                return link_to_page(title, display)
            except:
                pass
        return match.group(0)
    return link_pattern.sub(replace, rendered)

def substitute_spoiler_tags(text):
    return text.replace('<spoiler>', '<div class="spoiler" markdown="1">').replace('</spoiler>', '</div>')

def render_text(text):
    # 특정 인라인 HTML 안에서는 MD 변환이 잘 진행되도록
    # python-markdown에 잘 문서화되지 않은 기능 사용 - https://github.com/waylan/Python-Markdown/issues/52 참조
    md = markdown.Markdown(extensions=["toc", "tables"])
    md.preprocessors['html_block'].markdown_in_raw = True

    text = substitute_spoiler_tags(text)
    text = highlight_code_section(text)
    text = urlize(text)
    text = link_to_entities(text)
    text = md.convert(text)
    return text
