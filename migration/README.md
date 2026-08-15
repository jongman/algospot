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

South remains installed in the archived Django 1.6 runtime. Django 1.7 reads
the preserved project history through native migration files before crossing
the Django 1.8 removal boundary for `django.contrib.comments`.

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

## Django 1.8 checkpoint

The `django18` profile pins Django 1.8.19 and replaces the removed built-in
comments application with `django-contrib-comments` 1.8.0. A compatibility
adapter keeps the original `comments` application label, database tables, and
generic content-type references. The Django 1.8 image alone also advances
django-guardian to 1.3.2, django-haystack to 2.4.1, and django-tagging to 0.3.6.
The Django 1.6 and 1.7 images retain the archived package versions.

`djcelery` is omitted from Django 1.8's `INSTALLED_APPS` because its bundled
`migrations` package contains South migrations that Django 1.8 cannot load.
The package and existing Celery loader remain present; no worker or broker is
started in this isolated web profile.

```sh
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile django18 build django18-web
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile django18 up -d --wait django18-web
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile django18 run --rm django18-smoke
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile django18 run --rm django18-auth-smoke
```

To rehearse the native migration adoption, refresh the hard-coded scratch
database with `bridge-clone`, then run Django 1.8's migration command:

```sh
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm bridge-clone
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm django18-migrate
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools up -d --wait django18-scratch-web
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm django18-scratch-smoke
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm django18-scratch-auth-smoke
```

On the 2026-08-14 snapshot, `--fake-initial` adopts 13 existing initial
migrations and applies eight follow-up migrations. The 21 recorded migrations
leave all verified core row counts unchanged. The expected schema deltas are a
comments email-column expansion from 75 to 254 characters and a submit-date
index. Both scratch behavior suites pass with database transactions forced
read-only, and a repeat migration reports no work to apply. The original
`algospot_restore` evidence database remains unchanged and has no
`django_migrations` table.

## Django 1.9 through 1.11 checkpoints

The `django19`, `django110`, and `django111` profiles continue the Python 2
compatibility ladder through Django 1.11.29 LTS. They use the same read-only
database role, restored media, and characterization suites as the earlier
profiles. The Django 1.9 boundary moves generic relations to
`django.contrib.contenttypes.fields`, prevents newsfeed from importing models
during application discovery, and updates AppConf, Haystack, and tagging. The
Django 1.10 boundary adopts list-based URL configurations and `TEMPLATES`, and
updates avatar and Guardian. Django 1.11 uses Haystack 2.8.1 and fixes the one
absolute `FileField.upload_to` value rejected by its system checks.

Build and exercise any checkpoint by substituting its profile and service
prefix in the Django 1.8 commands above. For example, the final Python 2 gate is:

```sh
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile django111 build django111-web
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile django111 up -d --wait django111-web
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile django111 run --rm django111-smoke
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile django111 run --rm django111-auth-smoke
```

All six Django 1.6, 1.7, 1.8, 1.9, 1.10, and 1.11 profiles pass the same 13
anonymous HTTP checks plus signed-session authorization and media checks. The
pinned registration source remains untouched in the worktree; a documented
build-time patch supplies the small cross-version changes. The next boundary is
the modern Python runtime.

## Python 3.13 and Django 5.2 runtime

The `modern` profile is the local target runtime: Python 3.13.5, Django 5.2.5
LTS, PostgreSQL 17, psycopg 3, and maintained releases of the comments,
registration, avatar, Guardian, Haystack, tagging, Pillow, Pygments, iCalendar,
and Misaka dependencies. The application source has been ported to Python 3
and current Django APIs. The restored database and the 825 MB upload tree remain
read-only in the normal profile. Django remains solely on the internal network;
a credential-free TCP forwarder with masquerading disabled publishes it only at
`http://127.0.0.1:18090/`. The application container retains the capability,
network, filesystem, process, memory, and CPU restrictions used by the
characterization runtimes.

Build, start, and verify the modern read-only site with:

```sh
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile modern build modern-web
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile modern up -d --wait modern-web modern-loopback
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile modern run --rm modern-smoke
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile modern run --rm modern-auth-smoke
```

The web container intentionally contains no compilers, sandbox, broker, Celery
worker, or outbound network route. It displays the preserved set of submission
languages using static metadata; actual untrusted-code execution remains a
separate isolated judge-worker migration and must not be enabled in the web
process. Email is also disabled locally. The archived Whoosh index is retained
as evidence but is not loaded because it contains Python 2 pickles; local search
uses Haystack's maintained in-process backend instead.

### Modern schema rehearsal

Modern settings permit writes only when both the explicit
`MODERN_ALLOW_DATABASE_WRITES=scratch-only` opt-in and the hard-coded
`algospot_native_migrate` database name are present. The evidence database
cannot pass that guard. Rehearse the full migration directly from a fresh clone
of the untouched restore, then reconnect read-only for behavior checks:

```sh
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools stop modern-scratch-web
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm bridge-clone
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm modern-migrate
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools up -d --wait modern-scratch-web modern-scratch-loopback
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm modern-scratch-smoke
docker compose --project-directory migration \
  --env-file /path/to/restore.env --env-file /path/to/legacy.env \
  --profile tools run --rm modern-scratch-auth-smoke
```

On the 2026-08-14 snapshot, Django fakes the initial migrations for existing
tables, applies the maintained dependency and project follow-ups, and reports
no model changes afterward. The fresh migrated clone passes all 13 anonymous
checks plus account, authorization, object-permission, language-choice, media,
and forced-read-only checks. It preserves 180,942 users and all 2,443 database
media references; 2,430 referenced files are present, while the 13 already
documented missing legacy files remain missing. The immutable evidence database
is not given a migration recorder table.

## Disposable judge controller

Judging is a sibling-container topology, not Docker-in-Docker. The normal web
container never receives the Docker socket. One trusted `judge-controller`
service holds the socket and consumes durable, leased `JudgeJob` rows from
PostgreSQL. A crashed controller leaves a lease that another controller can
recover. New `RECEIVED` and `REJUDGE_REQUESTED` submissions are queued by ID;
no Django model is serialized into a broker message.

The controller creates one disposable compile container and a fresh run
container for every test case. Commands and images come from a server-owned
allowlist, not submission input. Each container has no network, a read-only
root filesystem, no capabilities, `no-new-privileges`, an unprivileged UID,
bounded processes, CPU, memory, files, output, and wall time. Only the compile
directory is writable during compilation. Run containers receive the compiled
work directory read-only and exactly one input file; expected output, other
cases, media, the database, credentials, and the Docker socket are absent.
Special checkers run in another disposable sandbox that cannot reach the
submission container.

Real submissions fail closed unless Docker exposes the gVisor `runsc` runtime.
The `runc` opt-in exists solely for the checked-in controlled smoke program;
it cannot start the queue consumer. On the configuration host:

```sh
sudo ./scripts/install-gvisor.sh
./scripts/run-algospot-judge.sh build
./scripts/run-algospot-judge.sh migrate
./scripts/run-algospot-judge.sh smoke
./scripts/run-algospot-judge.sh queue-report
```

`queue-report` is dry-run by default. `queue-apply` enqueues only rows still in
`RECEIVED` or `REJUDGE_REQUESTED`. The snapshot's old `COMPILING`, `RUNNING`,
and `JUDGING` rows are deliberately excluded; an operator must decide their
verdict or request a rejudge explicitly.

The local images are a modernization-development toolchain. They preserve all
language IDs and include pinned base images, but their compiler/interpreter
versions are not equivalent to the live 2014-era stack. Do not cut production
traffic over based on the local smoke test. Before production, build and
characterize per-language legacy-compatible images, push them to a controlled
registry, set every `JUDGE_*_IMAGE` value to an `@sha256:` reference, set
`JUDGE_REQUIRE_IMAGE_DIGESTS=1`, run representative accepted/wrong-answer/time
limit/special-checker submissions through both judges, and review every
verdict difference.

For an eventual writable production database, the controller uses
`MODERN_ALLOW_DATABASE_WRITES=judge-controller` together with
`algospot.judge_settings` and the explicit controller opt-in. The local Compose
profile remains restricted to the disposable `algospot_native_migrate` clone.
The controller owns the Docker socket and is therefore host-administrator
equivalent; a dedicated judge VPS is the preferred production boundary.
