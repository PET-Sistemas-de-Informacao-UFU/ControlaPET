#!/usr/bin/env bash
set -euo pipefail
umask 077

if [[ $# -ne 2 ]]; then
  printf 'Uso: bash restore-db.sh ARQUIVO.dump NOVO_BANCO\n' >&2
  exit 2
fi

backup=$1
target=$2
if [[ ! -f "$backup" || ! "$target" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ || ${#target} -gt 63 ]]; then
  printf 'Informe um arquivo de backup existente e o nome de um novo banco.\n' >&2
  exit 2
fi

pg_restore --list -- "$backup" >/dev/null
# createdb falha se o destino ja existe. Nenhum banco ou tabela e apagado.
createdb --no-password -- "$target"
pg_restore --no-password --exit-on-error --single-transaction \
  --no-owner --no-privileges --dbname="$target" -- "$backup"
printf 'Backup restaurado no novo banco: %s\n' "$target"
