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
