FROM python:2.7.18-buster@sha256:d8fac68ebdc45b8d66d53f1ed6c1532da81109a8f5532a6ca0c951ed31107d70

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Buster and Python 2 are both archived. Keep this image disposable and never
# expose it beyond the localhost-only migration lab.
RUN sed -i \
      -e 's|deb.debian.org/debian|archive.debian.org/debian|g' \
      -e 's|security.debian.org/debian-security|archive.debian.org/debian-security|g' \
      -e '/buster-updates/d' \
      /etc/apt/sources.list \
    && apt-get -o Acquire::Check-Valid-Until=false update \
    && apt-get install -y --no-install-recommends \
      gcc \
      libc6-dev \
      libfreetype6-dev \
      libjpeg62-turbo-dev \
      libpq-dev \
      zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY migration/legacy/requirements.txt /tmp/requirements.txt
RUN python -m pip install --no-cache-dir \
      'pip==20.3.4' 'setuptools==44.1.1' 'wheel==0.37.1' \
    && python -m pip install --no-cache-dir -r /tmp/requirements.txt \
    && python -c 'import celery, django, kombu, psycopg2; print("legacy dependency imports: OK")'

# These are the exact fork commits recorded by the production superproject.
COPY libs/django-registration /tmp/django-registration
COPY libs/misaka /tmp/misaka
RUN python -m pip install --no-cache-dir /tmp/django-registration \
    && python -m pip install --no-cache-dir /tmp/misaka \
    && rm -rf /tmp/django-registration /tmp/misaka

COPY migration/legacy/entrypoint.sh /usr/local/bin/algospot-legacy-entrypoint
RUN chmod 0755 /usr/local/bin/algospot-legacy-entrypoint

WORKDIR /app/www
EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/algospot-legacy-entrypoint"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000", "--noreload"]
