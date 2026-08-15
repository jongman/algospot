FROM python:3.13.5-slim-bookworm@sha256:4c2cf9917bd1cbacc5e9b07320025bdb7cdf2df7b0ceaccb55e9dd7e30987419

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libc6-dev \
    && rm -rf /var/lib/apt/lists/*

COPY migration/modern/requirements.txt /tmp/requirements.txt
RUN python -m pip install --no-cache-dir --upgrade pip==25.1.1 \
    && python -m pip install --no-cache-dir -r /tmp/requirements.txt \
    && python -c 'import django, psycopg; print(django.get_version(), psycopg.__version__)'

# django-tagging 0.5.0 already uses current relationship APIs, but its final
# release retained the encoding helper renamed by Django 4. Keep this one-line
# compatibility repair isolated to the image rather than monkey-patching
# Django at application startup.
RUN sed -i 's/smart_text/smart_str/g' \
      /usr/local/lib/python3.13/site-packages/tagging/models.py \
    && sed -i \
      's/models.CharField(_("object ID"), max_length=255)/models.PositiveIntegerField(_("object ID"))/' \
      /usr/local/lib/python3.13/site-packages/guardian/models/models.py \
    && sed -i \
      's/models.CharField(max_length=255, verbose_name="object ID")/models.PositiveIntegerField(verbose_name="object ID")/g' \
      /usr/local/lib/python3.13/site-packages/guardian/migrations/0001_initial.py \
    && sed -i \
      '/^def _casts_to_bigint/! s/_casts_to_bigint(handle_pk_field)/False/g' \
      /usr/local/lib/python3.13/site-packages/guardian/shortcuts.py

COPY migration/legacy/entrypoint.sh /usr/local/bin/algospot-modern-entrypoint
RUN chmod 0755 /usr/local/bin/algospot-modern-entrypoint

WORKDIR /app/www
EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/algospot-modern-entrypoint"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000", "--noreload"]
