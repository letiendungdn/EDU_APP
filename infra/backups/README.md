# Database backups

Script dump PostgreSQL DB `nihongo` từ container `edu-postgres-nihongo`.

## Chạy backup

```powershell
npm run db:backup
# hoặc
powershell -NoProfile -ExecutionPolicy Bypass -File infra/backups/backup.ps1
```

```bash
bash infra/backups/backup.sh
```

Yêu cầu: `edu-postgres-nihongo` đang chạy.

## Output (cùng thư mục này)

| File | Nội dung |
|------|----------|
| `nihongo_YYYYMMDD_HHMMSS.sql` | Full dump DB nihongo |
| `nihongo_schema_YYYYMMDD_HHMMSS.sql` | Schema only |

Snapshot **nihongo** `*.sql` được commit trong repo (restore nhanh). Chạy `npm run db:backup` để tạo bản mới; thay file timestamp mới nhất khi cần.

## Restore

Không pipe file qua PowerShell (`Get-Content … | docker exec -i …`): PowerShell 5.1 đổi bảng mã khi pipe sang chương trình ngoài nên chữ Việt/Nhật bị hỏng. Copy file vào container rồi chạy `psql -f`:

```powershell
docker cp infra\backups\nihongo_20261004_211325.sql edu-postgres-nihongo:/tmp/restore.sql
docker exec edu-postgres-nihongo psql -U nihongo -d nihongo -f /tmp/restore.sql
```

Schema chat tham khảo: [`docs/sql/chat-schema.sql`](../../docs/sql/chat-schema.sql)
