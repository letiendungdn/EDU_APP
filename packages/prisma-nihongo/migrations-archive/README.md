# Migration cũ (đã gộp vào baseline)

Các thư mục ở đây là lịch sử migration trước ngày 2026-09-26. Prisma **không** đọc thư mục này.

Vì sao gộp: commit `4e6293d` đã xóa 10 migration đầu tiên, và một số bảng (vd `CoachingSession`)
từng được tạo bằng `prisma db push` nên chưa bao giờ có migration. Kết quả là `prisma migrate deploy`
trên DB trống bị lỗi ngay migration đầu.

Thay bằng: `migrations/20260926130000_baseline` — sinh từ `schema.prisma`:

```sh
npx prisma migrate diff --from-empty --to-schema-datamodel schema.prisma --script
```

DB đã có sẵn dữ liệu (tạo trước khi gộp) chỉ cần đánh dấu baseline là đã chạy:

```sh
npx prisma migrate resolve --applied 20260926130000_baseline
```

Ghi chú khi đọc lại: vài migration ở đây có câu UPDATE sửa dữ liệu. DB mới lấy dữ liệu từ
`infra/postgres/nihongo-content-seed.sql` và các `seed-*.ts`, nên không cần chạy lại các câu đó.
