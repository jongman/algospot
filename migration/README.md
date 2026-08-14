# Database restore lab

This Compose project restores the private PostgreSQL 9.3 logical dump into a
separate PostgreSQL 17 database named `algospot_restore`. It does not start the
legacy web or judge processes.

```console
cd /home/jongman/config
sudo ./scripts/restore-algospot-database.sh
```

The helper stores its generated local password and reports under the private
snapshot's `restore-lab/` directory. PostgreSQL runs on an internal-only Docker
network and publishes no host port. Keep the dump directory private and never
add restore credentials or database artifacts to Git.

To destroy only this lab after testing:

```console
sudo docker compose \
  --project-directory /home/jongman/git/algospot/migration \
  --env-file /home/jongman/migrations/algospot/20260814T184455Z/restore-lab/restore.env \
  down --volumes
```
