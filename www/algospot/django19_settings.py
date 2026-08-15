# -*- coding: utf-8 -*-
"""Django 1.9 compatibility checkpoint."""

from algospot.django18_settings import *


TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.template.context_processors.debug',
    'django.template.context_processors.i18n',
    'django.template.context_processors.media',
    'django.template.context_processors.static',
    'django.contrib.messages.context_processors.messages',
    'django.template.context_processors.request',
    'forum.processors.add_categories',
    'base.processors.select_campaign',
)

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': TEMPLATE_DIRS,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': TEMPLATE_CONTEXT_PROCESSORS,
        },
    },
]

# The TEMPLATES backend above is authoritative from Django 1.8 onward. Clear
# the legacy mirrors so newer system checks do not treat both configurations
# as active.
TEMPLATE_DIRS = ()
TEMPLATE_CONTEXT_PROCESSORS = ()
TEMPLATE_LOADERS = ()
TEMPLATE_DEBUG = False
