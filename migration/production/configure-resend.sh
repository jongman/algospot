#!/bin/bash
set -Eeuo pipefail
umask 077

environment_file=/srv/algospot/production.env
app_dir=/srv/algospot/app
compose_file="$app_dir/migration/production/compose.yaml"

if [[ ! -t 0 ]]; then
  echo "Run this command from an interactive SSH terminal." >&2
  exit 1
fi
if [[ ! -f "$environment_file" || ! -f "$compose_file" ]]; then
  echo "The Algospot production deployment is not installed." >&2
  exit 1
fi
if [[ ! -w "$environment_file" ]]; then
  echo "The current user cannot update $environment_file." >&2
  exit 1
fi

read -r -s -p "Resend production API key: " resend_api_key
echo
if [[ "$resend_api_key" != re_* || ${#resend_api_key} -lt 20 ||
      "$resend_api_key" == *$'\n'* || "$resend_api_key" == *$'\r'* ]]; then
  unset resend_api_key
  echo "That does not look like a Resend API key." >&2
  exit 1
fi

default_sender=noreply@notify.algospot.com
read -r -p "Intended From address [$default_sender]: " sender_address
sender_address=${sender_address:-$default_sender}
if [[ ! "$sender_address" =~ ^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$ ]]; then
  unset resend_api_key
  echo "Invalid From address: $sender_address" >&2
  exit 1
fi

backup_file="$environment_file.before-resend.$(date --utc +%Y%m%dT%H%M%SZ)"
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

set_environment ALGOSPOT_EMAIL_BACKEND \
  django.core.mail.backends.smtp.EmailBackend
set_environment ALGOSPOT_EMAIL_HOST smtp.resend.com
set_environment ALGOSPOT_EMAIL_PORT 587
set_environment ALGOSPOT_EMAIL_HOST_USER resend
set_environment ALGOSPOT_EMAIL_HOST_PASSWORD "$resend_api_key"
set_environment ALGOSPOT_EMAIL_USE_TLS 1
set_environment ALGOSPOT_EMAIL_USE_SSL 0
set_environment ALGOSPOT_EMAIL_TIMEOUT 10
set_environment ALGOSPOT_DEFAULT_FROM_EMAIL "$sender_address"
set_environment ALGOSPOT_SERVER_EMAIL "$sender_address"
unset resend_api_key

compose() {
  docker compose --env-file "$environment_file" -f "$compose_file" "$@"
}

if ! compose config --quiet ||
   ! compose up -d --force-recreate --wait web ||
   ! compose exec -T web python manage.py shell -c \
     'from django.core.mail import get_connection; connection = get_connection(); assert connection.open(); connection.close(); print("Resend SMTP authentication succeeded.")'; then
  echo "Resend configuration failed; restoring the previous environment." >&2
  cp --preserve=mode,ownership,timestamps "$backup_file" "$environment_file"
  compose up -d --force-recreate --wait web || true
  exit 1
fi

echo
echo "Resend SMTP is configured. Secret backup: $backup_file"
echo "Resend must verify the sender domain before messages can reach users."
