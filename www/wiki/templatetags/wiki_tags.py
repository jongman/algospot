from diff_match_patch import diff_match_patch
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

# shamelessly copied from
# https://github.com/emesik/djiki/blob/master/djiki/templatetags/djiki_tags.py
@register.filter
def html_diff(diff):
    html = []
    for (op, data) in diff:
        text = data.replace("&", "&amp;").replace("<", "&lt;")\
                .replace(">", "&gt;").replace("\n", "&para;<br />")
        if op == diff_match_patch.DIFF_INSERT:
            html.append(u"<ins class=\"added\">%s</ins>" % text)
        elif op == diff_match_patch.DIFF_DELETE:
            html.append(u"<del class=\"removed\">%s</del>" % text)
        elif op == diff_match_patch.DIFF_EQUAL:
            html.append(u"<span>%s</span>" % text)
    return mark_safe("".join(html))
