# Database backups

Script dump PostgreSQL từ Docker container `edu-postgres`.

## Chạy backup

```powershell
npm run db:backup
# hoặc
powershell -NoProfile -ExecutionPolicy Bypass -File infra/backups/backup.ps1
```

```bash
bash infra/backups/backup.sh
```

Yêu cầu: `docker compose up -d postgres`

## Output (cùng thư mục này)

| File | Nội dung |
|------|----------|
| `nihongo_YYYYMMDD_HHMMSS.sql` | Full dump DB nihongo |
| `english_learning_YYYYMMDD_HHMMSS.sql` | Full dump DB english |
| `nihongo_schema_YYYYMMDD_HHMMSS.sql` | Schema only |

File `*.sql` được commit trong repo (snapshot restore). Chạy `npm run db:backup` để tạo bản mới; có thể thay file timestamp mới nhất khi cần.

## Restore

```bash
docker exec -i edu-postgres psql -U nihongo nihongo < infra/backups/nihongo_20260627_120000.sql
```

Schema chat tham khảo: [`docs/sql/chat-schema.sql`](../../docs/sql/chat-schema.sql)
