# Database restore lab

This Compose project restores the private PostgreSQL 9.3 logical dump into a
separate PostgreSQL 17 database named `algospot_restore`. It does not start the
legacy web or judge processes.

```console
cd /home/jongman/config
./scripts/restore-algospot-database.sh
```

The helper stores its generated local password and reports under the private
snapshot's `restore-lab/` directory. PostgreSQL runs on an internal-only Docker
network and publishes no host port. Keep the dump directory private and never
add restore credentials or database artifacts to Git.

To destroy only this lab after testing:

```console
docker compose \
  --project-directory /home/jongman/git/algospot/migration \
  --env-file /home/jongman/migrations/algospot/20260814T184455Z/restore-lab/restore.env \
  down --volumes
```

## Legacy web compatibility runtime

After the restore succeeds, build and start the Python 2/Django 1.6 web process
through the helper in the configuration repository:

```console
cd /home/jongman/config
./scripts/run-algospot-legacy-web.sh up
```

The helper initializes the two pinned Git submodules, creates a read-only
PostgreSQL role, builds the archived runtime, and publishes it only at
`http://127.0.0.1:18080/`. Uploads and the preserved Whoosh index are mounted
read-only. The container has no external network route, broker, Celery worker,
email backend, judge work directory, Linux capabilities, or writable root
filesystem. Because Whoosh insists on a writable directory, startup copies the
archived read-only index into an ephemeral 256 MB in-memory filesystem; index
locks and other runtime changes disappear with the container.

Useful lifecycle commands are `status`, `logs`, `smoke`, `stop`, and `rebuild`.
The `smoke` action runs anonymous route checks from inside the isolated network
plus signed-session permission and media-reference checks. It stores both
reports beside the runtime credentials and logs in the snapshot's private
`restore-lab/` directory. The signed sessions contain only database user IDs;
the checks neither know nor change any production password.

## Django 1.7 bridge

The `bridge` profile is the first modernization checkpoint. It uses the same
Python 2 dependency set, read-only database role, archived media, and smoke
tests as the legacy profile, but builds Django 1.7.11. Keeping it separate
means a bridge regression cannot obscure whether the archived Django 1.6.5
runtime still works.

Build and run the bridge from the repository root with the same private
`restore.env` and `legacy.env` files used by the legacy profile:

```sh
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile bridge build bridge-web
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile bridge up -d --wait bridge-web
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile bridge run --rm bridge-smoke
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile bridge run --rm bridge-auth-smoke
```

South remains installed at this checkpoint so the production migration
history is untouched. The next checkpoint moves the project migration files
to Django's native migration framework before crossing the Django 1.8 removal
boundary for `django.contrib.comments`.

Django 1.7's stock development server tries to create its migration-recorder
table during startup. The bridge launcher skips that one startup check because
the characterization role is deliberately read-only. It does not change the
behavior of `manage.py migrate`; schema conversion must use a separate,
disposable writable database.

The bridge passes the same 13 anonymous HTTP checks and signed-session
authorization/media suite as Django 1.6. Private run reports are kept in the
snapshot's `restore-lab/` directory as `characterization-bridge-http.txt` and
`characterization-bridge-auth-media.txt`.

## Native migration rehearsal

The historical South files live in each project app's `south_migrations`
package and remain visible to Django 1.6 through `SOUTH_MIGRATION_MODULES`.
Django 1.7 uses `algospot.bridge_settings`, removes South from
`INSTALLED_APPS`, and loads the generated native `0001_initial` migrations.

Rehearse adoption only on the hard-coded `algospot_native_migrate` scratch
database. `bridge-clone` replaces that database from `algospot_restore`, and
`bridge-migrate` records all existing migrations with Django 1.7's `--fake`
option. The bridge settings refuse the write opt-in if any other database name
is configured.

```sh
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm bridge-clone
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm bridge-migrate
```

On the 2026-08-14 snapshot this creates only the four-column
`django_migrations` bookkeeping table, marks ten migrations applied, and
preserves the verified core row counts. The same native graph also builds an
empty database successfully. A clean build bootstraps the required `everyone`
group before Guardian creates its anonymous user. Private evidence is stored
as `native-migration-rehearsal.txt` and
`native-migration-verification.txt` in the snapshot's `restore-lab/`
directory.
