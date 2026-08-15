# -*- coding: utf-8 -*-
"""Tagging API shared by the archived and upgraded package releases."""

try:
    from tagging.registry import register
except ImportError:
    from tagging import register

from tagging.forms import TagField
