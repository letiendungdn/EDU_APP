# Database backups

Script dump PostgreSQL từ 2 container Docker riêng: `edu-postgres-nihongo` và `edu-postgres-english`.

## Chạy backup

```powershell
npm run db:backup
# hoặc
powershell -NoProfile -ExecutionPolicy Bypass -File infra/backups/backup.ps1
```

```bash
bash infra/backups/backup.sh
```

Yêu cầu: `edu-postgres-nihongo` đang chạy. English chỉ dump nếu `edu-postgres-english` đang chạy.

## Output (cùng thư mục này)

| File | Nội dung |
|------|----------|
| `nihongo_YYYYMMDD_HHMMSS.sql` | Full dump DB nihongo |
| `english_learning_YYYYMMDD_HHMMSS.sql` | Full dump DB english *(chỉ khi `edu-postgres-english` up — có thể chưa có trong repo)* |
| `nihongo_schema_YYYYMMDD_HHMMSS.sql` | Schema only |

Snapshot **nihongo** `*.sql` được commit trong repo (restore nhanh). Chạy `npm run db:backup` để tạo bản mới; thay file timestamp mới nhất khi cần.

## Restore

```powershell
Get-Content infra\backups\nihongo_20260725_144146.sql | docker exec -i edu-postgres-nihongo psql -U nihongo nihongo
# English (tùy chọn, nếu có container + file backup):
# Get-Content infra\backups\english_learning_YYYYMMDD_HHMMSS.sql | docker exec -i edu-postgres-english psql -U english english_learning
```

Schema chat tham khảo: [`docs/sql/chat-schema.sql`](../../docs/sql/chat-schema.sql)
