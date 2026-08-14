# Database restore lab

This Compose project restores the private PostgreSQL 9.3 logical dump into a
separate PostgreSQL 17 database named `algospot_restore`. It does not start the
legacy web or judge processes.

```sh
cd migration
cp .env.example .env
docker compose up -d postgres
docker compose --profile tools run --rm restore
docker compose exec postgres \
  psql -U algospot -d algospot_restore -c '\\dt'
docker compose exec -T postgres \
  psql -U algospot -d algospot_restore < verify.sql
```

The `.env` password is only for the loopback-bound local lab. Keep the dump
directory private and never add `.env` or database artifacts to Git.

To destroy only this lab after testing:

```sh
docker compose down --volumes
```
