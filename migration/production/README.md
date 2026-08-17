# Algospot production stack

This stack is distinct from the migration laboratory in `../compose.yaml`.
It restores a disposable pre-cutover copy into the production schema, serves
the modern Django application with Gunicorn behind Caddy, and runs the trusted
judge controller beside disposable gVisor submission containers.

The checked-in environment example is deliberately safe for staging: Caddy
binds only to `127.0.0.1:18090`, TLS redirection and secure cookies are off,
and legacy submissions cannot be rejudged. Access it with an SSH tunnel:

```console
ssh -L 18090:127.0.0.1:18090 ubuntu@vps-05290a25.vps.ovh.us
```

On the server, copy `production.env.example` to
`/srv/algospot/production.env`, replace both secrets, and set mode `0600`.
Then run from `/srv/algospot/app`:

```console
docker compose --env-file /srv/algospot/production.env \
  -f migration/production/compose.yaml --profile build build
docker compose --env-file /srv/algospot/production.env \
  -f migration/production/compose.yaml --profile tools run --rm restore
docker compose --env-file /srv/algospot/production.env \
  -f migration/production/compose.yaml --profile tools run --rm migrate
docker compose --env-file /srv/algospot/production.env \
  -f migration/production/compose.yaml --profile tools run --rm collectstatic
docker compose --env-file /srv/algospot/production.env \
  -f migration/production/compose.yaml up -d --wait
```

The destructive `restore` step is only for constructing the staging copy or
the coordinated final cutover. Never run it against a live writable database.
Before DNS cutover, take a final dump and media delta from the old host, repeat
the restore/migrate validation while submissions are paused, configure public
80/443 and Caddy's production site address, enable rejudging for newly created
jobs, and verify off-site backup restoration.

## Transactional email

Production email is fail-closed: it remains on Django's dummy backend until an
authenticated SMTP relay is installed. Resend can be configured without putting
its API key in shell history:

```console
ssh -t ubuntu@vps-05290a25.vps.ovh.us \
  /srv/algospot/app/migration/production/configure-resend.sh
```

The script prompts invisibly for the production API key, asks for the intended
From address, updates `/srv/algospot/production.env` with mode `0600`, recreates
only the web service, and verifies an authenticated STARTTLS connection without
sending a message. Domain verification is still required before Resend will
deliver to arbitrary users.

After SMTP and off-site backup verification succeed, prepare everything except
the external DNS change:

```console
/srv/algospot/app/migration/production/prepare-cutover.sh
```

This pins both judge images by repository digest, enables rejudging only for
new container-toolchain jobs, binds Caddy to public 80/443, enables secure
cookies and HTTPS redirects, and recreates the stack. Caddy then waits for the
two A records to point to the VPS before obtaining public certificates. HSTS is
deliberately left disabled until the resulting HTTPS site has been verified.

## Restored static sites

The proxy also mounts `ALGOSPOT_LEGACY_STATIC_DIR` read-only. The preserved
August 14 snapshot supplies the old `/contest/` tree, `book.algospot.com`, and
the exact redirect table formerly served by `links.algospot.com`. The static
snapshot is kept outside the application checkout and included in the encrypted
VPS backup.

The dedicated Algospot restic recovery set contains a validated logical
PostgreSQL dump, uploaded media, this legacy static tree, the root-only
production environment, image digests, and an inventory manifest. Raw live
PostgreSQL files, disposable judge work directories, collected application
static files, and container images are intentionally excluded: they are either
unsafe to copy live or reproducible from the dump, checkout, and pinned image
references. The weekly restore test imports the database into a fresh
PostgreSQL container and compares database rows and both file-tree inventories.
