# -*- coding: utf-8 -*-
import re
import string
import random
import misaka
from django.utils.html import escape
from pygments import highlight
from pygments.lexers import get_lexer_by_name, guess_lexer
from pygments.formatters import HtmlFormatter
from judge.utils import link_to_problem
from wiki.utils import link_to_page

def render_text(text):
    ext = misaka.EXT_NO_INTRA_EMPHASIS \
        | misaka.EXT_AUTOLINK \
        | misaka.EXT_FENCED_CODE \
        | misaka.EXT_TABLES \
        | misaka.EXT_STRIKETHROUGH \
        | misaka.EXT_SUPERSCRIPT \
        | misaka.EXT_SUBSCRIPT \
        | misaka.EXT_LAX_HTML_BLOCKS
    render = misaka.HTML_HARD_WRAP \
            | misaka.HTML_TOC

    md = misaka.Markdown(CustomRenderer(render), \
            extensions = ext)

    return md.render(text)

def random_id(size):
    str = string.ascii_uppercase + string.ascii_lowercase + string.digits
    return ''.join(random.choice(str) for x in range(size))

class CustomRenderer(misaka.HtmlRenderer):
    LINK_REGEX = re.compile("\[\[(?:([^|\]]+)\|)?(?:([^:\]]+):)?([^\]]+)\]\]")

    def preprocess(self, doc):
        while True:
            self.spoiler_open_key = '{{%s}}' % random_id(16)
            if doc.find(self.spoiler_open_key) == -1:
                pass
            self.spoiler_close_key = '{{%s}}' % random_id(16)
            if doc.find(self.spoiler_close_key) == -1:
                pass
            break
        doc = self.substitute_spoiler_tags(doc)
        doc = self.link_to_entities(doc)
        return doc
    def postprocess(self, doc):
        doc = self.revert_spoiler_tags(doc)
        return doc
    def block_code(self, text, lang):
        text = text.replace('\t', '  ')
        try:
            lexer = get_lexer_by_name(lang, stripall=True)
        except:
            if lang:
                return u'\n<pre><code># 지정된 언어 %s를 찾을 수 없습니다.<br>%s</code></pre>\n' % \
                    (lang, escape(text.strip()))
            else:
                return u'\n<pre><code>%s</code></pre>\n' % \
                    escape(text.strip())
        formatter = HtmlFormatter(style='colorful')
        return highlight(text, lexer, formatter)
    def substitute_spoiler_tags(self, doc):
        doc = doc.replace('<spoiler>', self.spoiler_open_key + "\n")
        doc = doc.replace('</spoiler>', "\n" + self.spoiler_close_key)
        return doc
    def revert_spoiler_tags(self, doc):
        doc = doc.replace(self.spoiler_open_key, '<div class="spoiler">')
        doc = doc.replace(self.spoiler_close_key, '</div>')
        return doc
    def link_to_entities(self, doc):
        def replace(match):
            display = match.group(1)
            namespace = match.group(2) or ''
            title = match.group(3)
            try:
                if namespace == 'problem':
                    return link_to_problem(title, display)
                elif namespace == '':
                    return link_to_page(title, display)
            except:
                return match.group(0)
        return self.LINK_REGEX.sub(replace, doc)
