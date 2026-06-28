#!/usr/bin/env bash
# Backup PostgreSQL — nihongo và english_learning trên 2 container riêng
set -euo pipefail

OUT_DIR="$(cd "$(dirname "$0")" && pwd)"
TS="$(date +%Y%m%d_%H%M%S)"

declare -a CONTAINERS=("edu-postgres-nihongo:nihongo:nihongo" "edu-postgres-english:english:english_learning")

mkdir -p "$OUT_DIR"

for entry in "${CONTAINERS[@]}"; do
  IFS=':' read -r container user db <<< "$entry"
  if ! docker ps --format '{{.Names}}' | grep -qx "$container"; then
    echo "Container '$container' chưa chạy. Chạy: docker compose up -d postgres-nihongo postgres-english"
    exit 1
  fi
  file="$OUT_DIR/${db}_${TS}.sql"
  echo "Dump $db -> $file"
  docker exec "$container" pg_dump -U "$user" "$db" > "$file"
done

schema="$OUT_DIR/nihongo_schema_${TS}.sql"
echo "Dump schema nihongo -> $schema"
docker exec edu-postgres-nihongo pg_dump -U nihongo --schema-only nihongo > "$schema"

echo "Done. SQL dumps in infra/backups/"
