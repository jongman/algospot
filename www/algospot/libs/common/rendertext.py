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
from base.utils import link_to_user

def render_text(text):
    ext = misaka.EXT_NO_INTRA_EMPHASIS \
        | misaka.EXT_AUTOLINK \
        | misaka.EXT_FENCED_CODE \
        | misaka.EXT_TABLES \
        | misaka.EXT_STRIKETHROUGH \
        | misaka.EXT_SUPERSCRIPT \
        | misaka.EXT_SUBSCRIPT \
        | misaka.EXT_LAX_SPACING \
        | misaka.EXT_MATHJAX_SUPPORT
    render = misaka.HTML_HARD_WRAP \
            | misaka.HTML_TOC

    md = misaka.Markdown(CustomRenderer(render), \
            extensions = ext)

    return md.render(text)

def render_latex(text):
    ext = misaka.EXT_NO_INTRA_EMPHASIS \
        | misaka.EXT_AUTOLINK \
        | misaka.EXT_FENCED_CODE \
        | misaka.EXT_TABLES \
        | misaka.EXT_STRIKETHROUGH \
        | misaka.EXT_SUPERSCRIPT \
        | misaka.EXT_SUBSCRIPT \
        | misaka.EXT_LAX_SPACING \
        | misaka.EXT_MATHJAX_SUPPORT
    md = misaka.Markdown(AlgospotLatexRenderer(), \
            extensions = ext)
    
    return md.render(text)

def random_id(size):
    str = string.ascii_uppercase + string.ascii_lowercase + string.digits
    return ''.join(random.choice(str) for x in range(size))

class AlgospotLatexRenderer(misaka.BaseRenderer):
    def block_math(self, math):
        ret = "\\[\n"
        if text:
            ret += math
        ret += "\\]\n"
        return ret

    def block_code(self, text, lang):
        ret = "\\begin{lstlisting}"
        if lang:
            ret += "[language=" + lang + "]\n"
        else:
        	ret += "\n"
        if text:
            ret += text
        ret += "\\end{lstlisting}\n"
        return ret

    def block_quote(self, quote):
        ret = "\\begin{quote}\n"
        if quote:
            ret += quote + ""
        ret += "\\end{quote}\n"
        return ret

    def block_html(self, html):
        ret = "\\begin{lstlisting}\n"
        ret += "HTML Block here\n"
        if html:
            ret += html
        ret += "\\end{lstlisting}\n"
        return ret

    def header(self, text, level):
        grp = ''
        if level == 1:
            grp = 'section'
        elif level == 2:
            grp = 'subsection'
        else:
            grp = 'subsubsection'
        ret = "\\" + grp + "{"
        if text:
            ret += text
        ret += "}\n"
        return ret

    def hrule(self):
        return "\n\n\\hrule\n\n"

    def list(self, contents, is_ordered):
        env_name = is_ordered and 'enumerate' or 'itemize'
        ret = "\\begin{" + env_name + "}\n"
        if contents:
            ret += contents + "\n"
        ret += "\\end{" + env_name + "}\n"
        return ret

    def list_item(self, text, is_ordered):
        return "\\item " + text or '' + "\n"

    def paragraph(self, text):
        return text + "\n\n";

    def table(self, header, body):
        ret = "\\begin{center}\n\\begin{tabular}\n"
        if header:
            ret += header + "\n"
        if body:
            ret += body + "\n"
        ret += "\\end{tabular}\n\\end{center}\n"
        return ret

    def table_row(self, content):
        return re.sub(r' & $', '', content or '') + "\\\\"

    def table_cell(self, content, flags):
        return (content or '') + ' & '

    def autolink(self, link, is_email):
        return "\\url{" + (link or '') + "}"

    def codespan(self, code):
        return "\\lstinline|" + (code or '') + "|"

    def mathspan(self, math):
        return "$" + (math or '') + "$"

    def double_emphasis(self, text):
        return "\\textbf{" + (text or '') + "}"

    def emphasis(self, text):
        return "\\textit{" + (text or '') + "}"

    def image(self, link, title, alt_text):
        ret = "\colorbox{SkyBlue}{IMAGE HERE}"
        return ret

    def linebreak(self):
        return "\n\n"

    def link(self, link, title, content):
        return "\colorbox{Thistle}{LINK HERE}"

    def raw_html(self, raw_html):
        return "\colorbox{GreenYellow}{SOME RAW HTML}"

    def triple_emphasis(self, text):
        return "\\textit{\\textbf{" + (text or '') + "}}"

    def strikethrough(self, text):
        return "\\sout{" + (text or '') + "}"

    def superscript(self, text):
        return "$^{" + (text or '').replace("\\{", "").replace("\\}", "") + "}$"

    def subscript(self, text):
        return "$_{" + (text or '').replace("\\{", "").replace("\\}", "") + "}$"

    def entity(self, text):
        return text

    def normal_text(self, text):
        return text.replace('$', "\\$") \
                   .replace('#', "\\#") \
                   .replace('%', "\\%") \
                   .replace('&', "\\&") \
                   .replace('_', "\\_") \
                   .replace('{', "\\{") \
                   .replace('}', "\\}") \
                   .replace('^', "\\^{}") \
                   .replace('~', "\\~{}") \
                   .replace('. ', ".\n") # adding some line breaks

class CustomRenderer(misaka.HtmlRenderer):
    LINK_REGEX = re.compile("\[\[(?:([^|\]]+)\|)?(?:([^:\]]+):)?([^\]]+)\]\]")

    def preprocess(self, doc):
        while True:
            self.spoiler_open_key = '{{%s}}' % random_id(16)
            if doc.find(self.spoiler_open_key) != -1:
                continue
            self.spoiler_close_key = '{{%s}}' % random_id(16)
            if self.spoiler_open_key == self.spoiler_close_key or doc.find(self.spoiler_close_key) != -1:
                continue
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
            lexer = get_lexer_by_name(lang, stripall=False)
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
                elif namespace == 'user':
                    return link_to_user(title, display)
                elif namespace == '':
                    return link_to_page(title, display)
            except:
                return match.group(0)
        return self.LINK_REGEX.sub(replace, doc)
