#!/bin/bash
set -Eeuo pipefail
umask 077

environment_file=/srv/algospot/production.env
app_dir=/srv/algospot/app
compose_file="$app_dir/migration/production/compose.yaml"

if [[ ! -w "$environment_file" || ! -f "$compose_file" ]]; then
  echo "The Algospot production deployment is unavailable." >&2
  exit 1
fi
if ! grep -q '^ALGOSPOT_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend$' \
    "$environment_file" ||
   ! grep -q '^ALGOSPOT_EMAIL_HOST_PASSWORD=re_' "$environment_file"; then
  echo "Configure Resend SMTP before preparing the public cutover." >&2
  exit 1
fi

toolchain_digest=$(docker image inspect algospot-judge-toolchain:production \
  --format '{{index .RepoDigests 0}}')
checker_digest=$(docker image inspect algospot-judge-checker:production \
  --format '{{index .RepoDigests 0}}')
digest_pattern='^[A-Za-z0-9][A-Za-z0-9._/-]*@sha256:[0-9a-f]{64}$'
if [[ ! "$toolchain_digest" =~ $digest_pattern ||
      ! "$checker_digest" =~ $digest_pattern ]]; then
  echo "Judge images do not have immutable repository digests." >&2
  exit 1
fi

backup_file="$environment_file.before-public.$(date --utc +%Y%m%dT%H%M%SZ)"
cp --preserve=mode,ownership,timestamps "$environment_file" "$backup_file"
chmod 0600 "$backup_file"

set_environment() {
  local wanted_key=$1
  local wanted_value=$2
  local temporary_file
  local found=false
  local line

  temporary_file=$(mktemp "${environment_file}.XXXXXX")
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "$wanted_key="* ]]; then
      printf '%s=%s\n' "$wanted_key" "$wanted_value" >>"$temporary_file"
      found=true
    else
      printf '%s\n' "$line" >>"$temporary_file"
    fi
  done <"$environment_file"
  if [[ "$found" == false ]]; then
    printf '%s=%s\n' "$wanted_key" "$wanted_value" >>"$temporary_file"
  fi
  chmod 0600 "$temporary_file"
  mv -f -- "$temporary_file" "$environment_file"
}

set_environment ALGOSPOT_BIND_ADDRESS 0.0.0.0
set_environment ALGOSPOT_HTTP_PORT 80
set_environment ALGOSPOT_HTTPS_PORT 443
set_environment ALGOSPOT_SITE_ADDRESS 'algospot.com, www.algospot.com'
set_environment ALGOSPOT_SECURE_SSL_REDIRECT 1
set_environment ALGOSPOT_SESSION_COOKIE_SECURE 1
set_environment ALGOSPOT_CSRF_COOKIE_SECURE 1
set_environment ALGOSPOT_SECURE_HSTS_SECONDS 0
set_environment ALGOSPOT_REJUDGE_ENABLED 1
set_environment JUDGE_TOOLCHAIN_IMAGE "$toolchain_digest"
set_environment JUDGE_CHECKER_IMAGE "$checker_digest"
set_environment JUDGE_REQUIRE_IMAGE_DIGESTS 1

compose() {
  docker compose --env-file "$environment_file" -f "$compose_file" "$@"
}

if ! compose config --quiet ||
   ! compose up -d --force-recreate --wait web judge-controller proxy ||
   ! compose exec -T judge-controller python manage.py shell -c \
     'from django.conf import settings; from judge.container_languages import DEFAULT_TOOLCHAIN_IMAGE; from judge.docker_executor import DisposableContainerExecutor; executor = DisposableContainerExecutor(runtime="runsc", work_root=settings.JUDGE_CONTAINER_WORK_ROOT, require_digest=True); executor._validate_image(DEFAULT_TOOLCHAIN_IMAGE); executor._validate_image(settings.JUDGE_CHECKER_IMAGE); print("Pinned judge images validated.")'; then
  echo "Public cutover preparation failed; restoring the previous environment." >&2
  cp --preserve=mode,ownership,timestamps "$backup_file" "$environment_file"
  compose up -d --force-recreate --wait web judge-controller proxy || true
  exit 1
fi

curl --fail --silent --show-error http://localhost/healthz >/dev/null
echo
echo "The VPS is listening on public ports 80/443 and waiting for DNS."
echo "Change algospot.com and www.algospot.com A records to 15.204.122.165."
echo "HSTS remains disabled until post-cutover verification is complete."
