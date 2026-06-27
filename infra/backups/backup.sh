#!/usr/bin/env bash
# Backup PostgreSQL (nihongo + english_learning) từ container edu-postgres
set -euo pipefail

CONTAINER="edu-postgres"
USER="nihongo"
OUT_DIR="$(cd "$(dirname "$0")" && pwd)"
TS="$(date +%Y%m%d_%H%M%S)"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Container '$CONTAINER' chưa chạy. Chạy: docker compose up -d postgres"
  exit 1
fi

mkdir -p "$OUT_DIR"

for db in nihongo english_learning; do
  file="$OUT_DIR/${db}_${TS}.sql"
  echo "Dump $db -> $file"
  docker exec "$CONTAINER" pg_dump -U "$USER" "$db" > "$file"
done

schema="$OUT_DIR/nihongo_schema_${TS}.sql"
echo "Dump schema nihongo -> $schema"
docker exec "$CONTAINER" pg_dump -U "$USER" --schema-only nihongo > "$schema"

echo "Done. SQL dumps in infra/backups/ (*.sql gitignored)"
