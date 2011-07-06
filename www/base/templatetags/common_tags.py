# -*- coding: utf-8 -*-
from __future__ import division
from django.core.urlresolvers import reverse
from django.utils.safestring import mark_safe
from django import template
import datetime
import re
import markdown
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter

register = template.Library()

@register.filter
def print_username(user):
    profile_link = reverse('user_profile', kwargs={"user_id": user.id})
    return mark_safe('<a href="%s" class="userlink">%s</a>' % 
            (profile_link, user.username))

@register.filter
def print_datetime(dt):
    diff = datetime.datetime.now() - dt
    if diff.seconds < 60:
        return u"방금 전"
    if diff.seconds < 60*60:
        return u"%d분 전" % (diff.seconds // 60)
    if diff.seconds < 6*60*60:
        return u"%d시간 전" % (diff.seconds // (60*60))
    return dt.strftime("%Y/%m/%d %H:%M")

code_pattern = re.compile(r'<code lang=([^>]+)>(.+?)</code>', re.DOTALL)
def syntax_highlight(text):
    def proc(match):
        lang = match.group(1).strip('"\'')
        lexer = get_lexer_by_name(lang, stripall=True)
        formatter = HtmlFormatter(style="colorful")
        code = match.group(2).replace("\t", "  ")
        highlighted = highlight(code, lexer, formatter)
        return highlighted.replace("\n", "<br/>")
    return code_pattern.sub(proc, text)

@register.filter
def render_text(text):
    text = syntax_highlight(text)
    text = markdown.markdown(text, extensions=["toc"])
    try:
        from wiki.utils import link_to_pages
        text = link_to_pages(text)
    except:
        pass
    return mark_safe(text)


