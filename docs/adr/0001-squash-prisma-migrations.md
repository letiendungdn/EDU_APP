# ADR-0001: Gộp (squash) migration Prisma thành một baseline

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-09-26
- **Phạm vi:** `packages/prisma-nihongo`

## Bối cảnh

- `prisma migrate deploy` trên **DB trống** lỗi ngay migration đầu tiên: commit `4e6293d` đã xoá 10 migration đầu,
  và một số bảng (vd `CoachingSession`) từng được tạo bằng `prisma db push` nên chưa bao giờ có migration.
- Hệ quả: không dựng được DB mới từ migration (CI, máy dev mới, môi trường staging), chỉ còn cách restore backup.
- Project dùng để học, **chưa có production** — không có DB nào khác ngoài máy dev cần giữ lịch sử migration.

## Các phương án

| Phương án | Ưu | Nhược |
|-----------|----|-------|
| A. Viết bù các migration còn thiếu | giữ lịch sử | rất khó tái tạo đúng trạng thái giữa chừng; dễ sai |
| B. **Squash**: một migration baseline sinh từ `schema.prisma` hiện tại | DB trống dựng được ngay; đơn giản | mất lịch sử từng bước; DB cũ phải đánh dấu baseline đã chạy |
| C. Bỏ migration, dùng `db push` | nhanh | không có migration cho production sau này; không review được thay đổi schema |

## Quyết định

Chọn **B**. Sinh baseline:

```sh
npx prisma migrate diff --from-empty --to-schema-datamodel schema.prisma --script > migrations/20260926130000_baseline/migration.sql
```

DB đã có dữ liệu: `npx prisma migrate resolve --applied 20260926130000_baseline`.
Migration cũ chuyển sang `migrations-archive/` (Prisma không đọc) để tra cứu.

## Hệ quả

- ✅ `migrate deploy` trên DB trống chạy được; CI dùng được migration thật.
- ✅ Từ nay mọi thay đổi schema **bắt buộc** qua `prisma migrate dev` — cấm `db push` với DB có dữ liệu.
- ⚠️ Không lùi được về trạng thái schema trước 2026-09-26 bằng migration (dùng backup trong `infra/backups/` nếu cần).
- ⚠️ Nếu sau này có production, **không** squash tuỳ tiện nữa: production đã chạy migration nào thì migration đó phải giữ nguyên.
- Bài học đi kèm: migration có câu `UPDATE` dữ liệu chạy trước seed trên DB mới → xem ADR-0003 và
  [learn-db-design.md](../learn-db-design.md) mục 11.
