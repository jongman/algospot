# -*- coding: utf-8 -*-

from models import Page
import re

link_pattern = re.compile("\[\[([^\]]+)\]\]")
def link_to_pages(rendered):
    return rendered


