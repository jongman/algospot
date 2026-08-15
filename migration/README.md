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
and stores a report beside the runtime credentials and logs in the snapshot's
private `restore-lab/` directory.
