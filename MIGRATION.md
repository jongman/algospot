# Algospot migration

This checkout is the working area for recovering and modernizing the legacy
production site. Do not use the production VPS as the development environment.

## Preserved source states

- `archive/server-chicago` points to production `HEAD` as found on 2026-08-14:
  `3cda1be3351837be9b92e6d257b7ac93817ffcfc`.
- `31518fb` preserves the tracked production working-tree changes found on the
  same date. It is the first commit on `codex/modernize`.
- GitHub copies are stored on
  `codex/archive-chicago-server-20260814` and
  `codex/archive-chicago-working-tree-20260814`.
- The private filesystem and database rescue snapshot lives outside this
  repository under `/home/jongman/migrations/algospot/20260814T184455Z`.

Never commit production database dumps, uploads, private configuration, or
credentials to Git.

## Target

The target application stack is Python 3.13, Django 5.2 LTS, and PostgreSQL 17.
The web application and judge worker must be separate services. The judge runs
untrusted submissions and must not share a privileged container, filesystem,
or service account with the public web application.

## Upgrade sequence

1. Restore and validate the PostgreSQL dump in the isolated restore lab under
   `migration/`.
2. Build a disposable Python 2/Django 1.6 compatibility environment and add
   characterization tests for login, profiles, forum/comments, problem views,
   submissions, permissions, media paths, and search behavior.

The compatibility runtime is defined by `migration/legacy/` and the
`legacy-web` Compose profile. It is intentionally localhost-only and connects
with a database role whose transactions are forced read-only. Never add a
Celery worker or judge service to this profile.

The 2026-08-14 baseline passes 13 anonymous HTTP checks plus signed-session
owner/other/admin permission checks without production passwords. The restored
media tree contains 6,369 files (825,057,406 bytes). Of 1,253 attachment and
1,190 avatar database references, one attachment and twelve avatars are
missing on both the live VPS and the rescue snapshot; treat these as preserved
legacy dangling references, not backup loss.

3. Move South history to native Django migrations at a compatible Django
   boundary. Preserve table names and verify row counts after every schema
   transition.

The `bridge` Compose profile pins Django 1.7.11 on Python 2 while retaining
South. It is the first reversible API boundary: both characterization suites
match the Django 1.6 baseline. The only application compatibility change at
this boundary replaces the removed `User.get_profile()` helper with the
equivalent `User.userprofile` one-to-one relation in Python and templates.
Native migration files can now be prepared on a separate writable copy of the
restored database.
4. Upgrade incrementally through supported API boundaries, resolving all
   deprecation warnings before each next step. Port the code to Python 3 before
   crossing to Django 2.
5. Replace removed or abandoned dependencies: `django.contrib.comments`,
   South, djcelery, old registration/avatar/tagging packages, pygooglechart,
   Whoosh integration, and the vendored Python-2 Misaka binding.
6. Split the judge worker from the web deployment and replace the 2014 LXC
   sandbox with an explicitly isolated runner. Do not expose the judge daemon
   during ordinary web-development work.
7. Run a staging rehearsal from a fresh production dump and media sync. Compare
   schema, table row counts, sampled files, user-visible pages, and a controlled
   submission before scheduling cutover.
8. At cutover, enter maintenance mode, stop Celery and web writes, take a final
   database dump and rsync delta, restore, verify, switch DNS/proxy traffic, and
   retain the VPS powered off but undeleted through the rollback window.

## Gates before decommissioning

- Two independently stored, checksummed backup copies.
- Successful clean-room database restore.
- Final media/file delta verified with a no-change rsync dry run.
- Git refs, stash, submodules, tracked diff, and untracked data accounted for.
- DNS, TLS renewal, email, cron/index updates, queues, logs, and monitoring
  moved or deliberately retired.
- Rollback procedure tested and a retention date recorded.
