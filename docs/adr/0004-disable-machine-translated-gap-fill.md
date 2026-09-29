# ADR-0004: Không seed dữ liệu "gap-fill" dịch máy từ OpenJLPT

- **Trạng thái:** Đã chấp nhận
- **Phạm vi:** `packages/prisma-nihongo/jlpt-kanji-gap-fill.data.ts`, `jlpt-vocab-gap-fill.data.ts`, `seed-jlpt-expand.ts`

## Bối cảnh

- Để phủ đủ danh sách kanji/từ vựng JLPT, script `scripts/build-jlpt-{kanji,vocab}-gap-fill.mjs` sinh dữ liệu từ OpenJLPT (tiếng Anh).
- Bộ dịch EN→VI trong script chỉ tra một bảng ~70 từ đơn: phần lớn nghĩa vẫn là tiếng Anh, hoặc thành "để …" vô nghĩa
  (mọi cụm bắt đầu bằng "to "). Hán-Việt cũng sai nhiều (部 "BẪU", 選 "SOÁT", 実 "CHÍ").
- App chủ yếu Việt–Nhật: một nghĩa sai dạy người học sai, tệ hơn là thiếu.

## Quyết định

- **Không** import hai file gap-fill vào mảng seed (ghi chú ⚠️ ngay trong `seed-jlpt-expand.ts`).
- Chữ còn thiếu được **soạn tay** theo đợt, có Hán-Việt / âm đọc / nghĩa / số nét kiểm tra
  (vd đợt 2026-09-27: 22 chữ gồm 願 局 候 … trong `jlpt-kanji-missing.data.ts`).

## Hệ quả

- ✅ Không có dữ liệu sai lọt vào DB.
- ⚠️ Kho kanji **chưa đủ**: truy vấn ở [learn-sql.md](../learn-sql.md) bài 9 chỉ ra 271 chữ có trong từ vựng nhưng chưa có trong
  bảng kanji (gồm chữ thông dụng như 列 可 才 忙 晴 箱 誤 誰 陽) → backlog soạn tay tiếp.
- ⚠️ File gap-fill vẫn nằm trong repo: dễ bị ai đó import lại. Cân nhắc xoá hẳn, hoặc giữ làm danh sách chữ cần soạn (chỉ dùng cột `character`).
- Nguyên tắc rút ra: **dữ liệu nội dung học phải qua kiểm duyệt con người**; tự động hoá chỉ dùng để tìm chỗ thiếu, không để điền nội dung.
