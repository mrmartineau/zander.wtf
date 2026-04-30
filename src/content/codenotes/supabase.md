---
title: Supabase
tags:
  - postgresql
  - database
date: 2026-04-30
---

## Backup and restore

These commands can be used to backup a Supabase PostgreSQL database. They use the `supabase` CLI tool to connect to your project and dump the schema, roles, and data into SQL files.

```sh
supabase login

npx supabase link --project-ref {your project ref}

mkdir -p backups

supabase db dump --linked \
  --role-only \
  -f backups/roles.sql

supabase db dump --linked \
  -f backups/schema.sql

supabase db dump --linked \
  --data-only \
  --use-copy \
  -f backups/data.sql
```