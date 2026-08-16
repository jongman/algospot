"""WSGI entry point for the production Gunicorn service."""

import os

from django.core.wsgi import get_wsgi_application


os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE', 'algospot.production_settings')
application = get_wsgi_application()

