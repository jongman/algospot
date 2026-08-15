FROM python:2.7.18-slim-buster@sha256:6c1ffdff499e29ea663e6e67c9b6b9a3b401d554d2c9f061f9a45344e3992363

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY migration/judge/sandbox_runner.py /opt/algospot/sandbox_runner.py
RUN chmod 0555 /opt/algospot/sandbox_runner.py \
    && mkdir -p /work /case \
    && chmod 0755 /work /case

WORKDIR /work
ENTRYPOINT ["python", "/opt/algospot/sandbox_runner.py"]
