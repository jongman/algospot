# -*- coding: utf-8 -*-
from __future__ import division
from diff_match_patch import diff_match_patch
from django.core.urlresolvers import reverse
from django.utils.safestring import mark_safe
from django import template
from django.contrib.comments.templatetags.comments import BaseCommentNode
from rendertext import render_text as actual_render_text
from rendertext import render_latex as actual_render_latex
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter
import datetime
import itertools
import re

PYGMENT_LANGUAGE_NAMES = {
    'pypy': 'py',
    'rs' : 'rust',
}

register = template.Library()

class GetLastCommentNode(BaseCommentNode):
    """ Get last comment into the context. """
    def get_context_value_from_queryset(self, context, qs):
        return qs.order_by("-id")[0] if qs.exists() else qs.none()

@register.tag
def get_last_comment(parser, token):
    return GetLastCommentNode.handle_token(parser, token)

class SourceCodeNode(template.Node):
    def __init__(self, code, lang):
        self.code = template.Variable(code)
        self.lang = template.Variable(lang)
    def render(self, context):
        code = self.code.resolve(context)
        lang = self.lang.resolve(context)
        lexer = get_lexer_by_name(PYGMENT_LANGUAGE_NAMES.get(lang, lang))
        formatter = HtmlFormatter(style="colorful")
        return highlight(code, lexer, formatter).replace("\n", "<br/>")

@register.tag
def syntax_highlight(parser, token):
    toks = token.split_contents()
    code, lang = toks[1:3]
    return SourceCodeNode(code, lang)

class TableHeaderNode(template.Node):
    def __init__(self, column_name, order_by, options):
        self.column_name = template.Variable(column_name)
        self.order_by = template.Variable(order_by)
        self.options = set(options)

    def render(self, context):
        current_order = context['request'].GET.get('order_by', '')
        column_name = self.column_name.resolve(context)
        order_by = self.order_by.resolve(context)
        arrow = ""
        is_default = 'default' in self.options
        if is_default and current_order == '': current_order = order_by

        can_toggle = 'notoggle' not in self.options
        if order_by == current_order:
            arrow = u"↓"
            if not can_toggle:
                return column_name + arrow
            else:
                new_order = '-' + order_by
        else:
            new_order = order_by
            if current_order.endswith(order_by):
                arrow = u"↑"

        get_params = dict(context['request'].GET)
        get_params['order_by'] = [new_order]
        get_params = '&'.join('%s=%s' % (k, v[0]) for k, v in get_params.items())
        full_path = context['request'].get_full_path().split('?')[0]
        return mark_safe(u"""<a href="%s?%s">%s%s</a>""" % (full_path, get_params, column_name, arrow))

@register.tag
def sortable_table_header(parser, token):
    toks = token.split_contents()
    column_name, order_by = toks[1:3]
    return TableHeaderNode(column_name, order_by, toks[3:])

@register.filter
def get_comment_hotness(count):
    threshold = [1, 5, 10, 50, 100]
    name = ["has_comment", "some_discussions", "heated_discussions",
            "very_heated_discussions", "wow"]
    ret = "none"
    for cnt, nam in zip(threshold, name):
        if cnt <= count:
            ret = nam
    return ret

@register.filter
def print_username(user):
    profile_link = reverse('user_profile', kwargs={"user_id": user.id})
    return mark_safe('<a href="%s" class="username">%s</a>' %
            (profile_link, user.username))

units = [(int(365.2425*24*60*60), u"년"),
         (30*24*60*60, u"달"),
         (7*24*60*60, u"주"),
         (24*60*60, u"일"),
         (60*60, u"시간"),
         (60, u"분")]

def format_readable(diff):
    for size, name in units:
        if diff >= size:
            return u"%d%s 전" % (int(diff / size), name)
    return u"방금 전"

@register.filter
def print_datetime(dt):
    fallback = dt.strftime("%Y/%m/%d %H:%M")
    diff = datetime.datetime.now() - dt
    # python 2.6 compatibility. no total_seconds() :(
    diff = diff.seconds + diff.days * 24 * 3600
    class_name = "hot" if diff < 24*3600 else ""
    return mark_safe(u'<span class="%s" title="%s">%s</span>' % (class_name,
        fallback, format_readable(diff) or fallback))

@register.filter
def render_text(text):
    return mark_safe(actual_render_text(text))

@register.filter
def render_latex(text):
    return mark_safe(actual_render_latex(text))

@register.filter
def safe_latex(text):
    return mark_safe(text.replace('$', "\\$") \
               .replace('#', "\\#") \
               .replace('%', "\\%") \
               .replace('&', "\\&") \
               .replace('_', "\\_") \
               .replace('{', "\\{") \
               .replace('}', "\\}") \
               .replace('^', "\\^{}") \
               .replace('~', "\\~{}"))

class PercentNode(template.Node):
    def __init__(self, a, b):
        self.a = template.Variable(a)
        self.b = template.Variable(b)
    def render(self, context):
        a = self.a.resolve(context)
        b = self.b.resolve(context)
        return str(int(a * 100 / b)) if b else "0"

@register.tag
def percentage(parser, token):
    toks = token.split_contents()
    a, b = toks[1:3]
    return PercentNode(a, b)

# shamelessly copied from
# http://code.activestate.com/recipes/577784-line-based-side-by-side-diff/

def side_by_side_diff(diff):
    """
    Calculates a side-by-side line-based difference view.

    Wraps insertions in <ins></ins> and deletions in <del></del>.
    """
    def yield_open_entry(open_entry):
        """ Yield all open changes. """
        ls, rs = open_entry
        # Get unchanged parts onto the right line
        if ls[0] == rs[0]:
            yield (False, ls[0], rs[0])
            for l, r in itertools.izip_longest(ls[1:], rs[1:]):
                yield (True, l, r)
        elif ls[-1] == rs[-1]:
            for l, r in itertools.izip_longest(ls[:-1], rs[:-1]):
                yield (l != r, l, r)
            yield (False, ls[-1], rs[-1])
        else:
            for l, r in itertools.izip_longest(ls, rs):
                yield (True, l, r)

    line_split = re.compile(r'(?:\r?\n)')
    open_entry = ([None], [None])
    for change_type, entry in diff:
        assert change_type in [-1, 0, 1]

        entry = (entry.replace('&', '&amp;')
                      .replace('<', '&lt;')
                      .replace('>', '&gt;'))

        lines = line_split.split(entry)

        # Merge with previous entry if still open
        ls, rs = open_entry

        line = lines[0]
        if line:
            if change_type == 0:
                ls[-1] = ls[-1] or ''
                rs[-1] = rs[-1] or ''
                ls[-1] = ls[-1] + line
                rs[-1] = rs[-1] + line
            elif change_type == 1:
                rs[-1] = rs[-1] or ''
                rs[-1] += '<ins>%s</ins>' % line if line else ''
            elif change_type == -1:
                ls[-1] = ls[-1] or ''
                ls[-1] += '<del>%s</del>' % line if line else ''

        lines = lines[1:]

        if lines:
            if change_type == 0:
                # Push out open entry
                for entry in yield_open_entry(open_entry):
                    yield entry

                # Directly push out lines until last
                for line in lines[:-1]:
                    yield (False, line, line)

                # Keep last line open
                open_entry = ([lines[-1]], [lines[-1]])
            elif change_type == 1:
                ls, rs = open_entry

                for line in lines:
                    rs.append('<ins>%s</ins>' % line if line else '')

                open_entry = (ls, rs)
            elif change_type == -1:
                ls, rs = open_entry

                for line in lines:
                    ls.append('<del>%s</del>' % line if line else '')

                open_entry = (ls, rs)

    # Push out open entry
    for entry in yield_open_entry(open_entry):
        yield entry

line_split = re.compile(r'(?:\r?\n)')
@register.filter
def html_diff(diff):
    left_line = 0
    right_line = 0
    changing = False
    last_unchanged_line = None
    consecutive_unchanged_lines = 0
    html = []
    html.append('<table>')
    for changed, left, right in side_by_side_diff(diff):
        if left != None:
            left_line += 1
        if right != None:
            right_line += 1
        if not changed:
            last_unchanged_line = (left_line, right_line, left)
            consecutive_unchanged_lines += 1
            if consecutive_unchanged_lines >= 2:
                changing = False
            if changing:
                html.append('<tr><td class="unchanged" colspan="2"><pre>%s</pre></td></tr>' % (left + '&para;' if left != None else ' '))
        else:
            consecutive_unchanged_lines = 0
            if not changing:
                if last_unchanged_line:
                    last_left_line, last_right_line, last_text = last_unchanged_line
                    html.append('<tr><td class="line-no diff-left">Line %d</td><td class="line-no diff-right">Line %d</td></tr>' % (last_left_line, last_right_line))
                    html.append('<tr><td class="unchanged" colspan="2"><pre>%s</pre></td></tr>' % (last_text + '&para;' if last_text != None else ' '))
                else:
                    html.append('<tr><td class="line-no diff-left">Line %d</td><td class="line-no diff-right">Line %d</td></tr>' % (left_line, right_line))
            changing = True
            html.append('<tr>')
            html.append('<td class="diff-left %s"><pre>%s</pre></td>' % ('empty' if left == None else '', left + '&para;' if left != None else ' '))
            html.append('<td class="diff-right %s"><pre>%s</pre></td>' % ('empty' if right == None else '', right + '&para;' if right != None else ' '))
            html.append('</tr>')
    html.append('</table>')
    return mark_safe("".join(html))
