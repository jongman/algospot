

# The archived worker imports Celery here. The modern web image deliberately
# omits that worker dependency and keeps judge execution in a separate service.
try:
    from .celery import app as celery_app
except ImportError:
    celery_app = None
