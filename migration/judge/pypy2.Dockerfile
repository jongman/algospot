FROM pypy:2.7-7.3.20-slim-bookworm@sha256:927e902ecc1577ad035b5c85398ffa3936648529a6f5645bf2269cebf55d05ae

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY migration/judge/sandbox_runner.py /opt/algospot/sandbox_runner.py
RUN chmod 0555 /opt/algospot/sandbox_runner.py \
    && mkdir -p /work /case \
    && chmod 0755 /work /case

WORKDIR /work
ENTRYPOINT ["pypy", "/opt/algospot/sandbox_runner.py"]
