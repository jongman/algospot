from diff_match_patch import diff_match_patch
from django import template
from django.utils.safestring import mark_safe
import itertools
import re

register = template.Library()

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
                html.append('<tr><td class="unchanged" colspan="2"><pre>%s</pre></td></tr>' % left)
        else:
            consecutive_unchanged_lines = 0
            if not changing:
                if last_unchanged_line:
                    last_left_line, last_right_line, last_text = last_unchanged_line
                    html.append('<tr><td class="line-no diff-left">Line %d</td><td class="line-no diff-right">Line %d</td></tr>' % (last_left_line, last_right_line))
                    html.append('<tr><td class="unchanged" colspan="2"><pre>%s</pre></td></tr>' % last_text)
                else:
                    html.append('<tr><td class="line-no diff-left">Line %d</td><td class="line-no diff-right">Line %d</td></tr>' % (left_line, right_line))
            changing = True
            html.append('<tr>')
            html.append('<td class="%s"><pre>%s</pre></td>' % ('diff-left' if left != None else 'empty', left if left else ' '))
            html.append('<td class="%s"><pre>%s</pre></td>' % ('diff-right' if right != None else 'empty', right if right else ' '))
            html.append('</tr>')
    html.append('</table>')
    return mark_safe("".join(html))
