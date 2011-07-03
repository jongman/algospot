# -*- coding: utf-8 -*-
import re
import markdown
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter

code_pattern = re.compile(r'<code lang=([^>]+)>(.+?)</code>', re.DOTALL)
def syntax_highlight(text):
    def proc(match):
        lang = match.group(1).strip('"\'')
        lexer = get_lexer_by_name(lang, stripall=True)
        formatter = HtmlFormatter(linenos=True, style="colorful")
        return highlight(match.group(2), lexer, formatter)
    return code_pattern.sub(proc, text)

def render_text(text):
    text = syntax_highlight(text)
    text = markdown.markdown(text, extensions=["toc"])
    return text

