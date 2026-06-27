# PostgreSQL — nihongo

## Nội dung học (Minna, Kanji KLL, JLPT reference…)

**Nguồn sự thật: PostgreSQL** — không còn file JSON trong `packages/prisma-nihongo/data/`.

| File | Mô tả |
|------|--------|
| `nihongo-content-seed.sql` | Dump data-only các bảng nội dung (commit vào git) |
| `dump-content-tables.sh` | Script dump (chạy trong container) |
| `export-content-seed.ps1` / `.sh` | Export từ DB local → SQL |

### Máy mới / DB trống

```bash
docker compose up -d postgres
npm run migrate:deploy -w @edu/prisma-nihongo
npm run seed -w @edu/prisma-nihongo   # import SQL nếu chưa có bài học
```

### Sau khi sửa nội dung trong DB (admin, SQL…)

```powershell
npm run db:export-content   # cập nhật nihongo-content-seed.sql từ DB
```

Ghi đè seed trên DB hiện tại:

```powershell
$env:FORCE_CONTENT_SEED=1; npm run seed -w @edu/prisma-nihongo
```

### Backup full (gồm user, payment…)

Xem [`../backups/README.md`](../backups/README.md).
