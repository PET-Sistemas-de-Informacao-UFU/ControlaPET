#!/usr/bin/env bash
set -euo pipefail
umask 077

if [[ $# -ne 1 ]]; then
  printf 'Uso: bash backup-db.sh DIRETORIO_DE_BACKUPS\n' >&2
  exit 2
fi

# A conexao usa PGHOST, PGPORT, PGDATABASE, PGUSER e PGPASSFILE, ou PGSERVICE.
mkdir -p -- "$1"
backup_dir=$(cd -- "$1" && pwd)
partial=$(mktemp "$backup_dir/.controlapet-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")
trap 'rm -f -- "$partial"' EXIT
pg_dump --no-password --format=custom --file="$partial"
pg_restore --list "$partial" >/dev/null
temporary_name=${partial##*/}
backup="$backup_dir/${temporary_name#.}.dump"
mv -- "$partial" "$backup"
printf 'Backup criado: %s\n' "$backup"
