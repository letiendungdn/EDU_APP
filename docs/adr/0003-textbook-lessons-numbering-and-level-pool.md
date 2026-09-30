# ADR-0003: Nội dung riêng theo giáo trình — đánh số bài và loại khỏi "kho theo cấp"

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-09-26
- **Phạm vi:** `Lesson`, `KanjiLesson`, `packages/nest-prisma/src/level-pool.ts`, content-service

## Bối cảnh

- Người học chọn "Sou Matome N3" nhưng trang từ vựng / ngữ pháp lại hiện nội dung Minna và bài bổ sung JLPT —
  vì chưa có khái niệm "bài này thuộc giáo trình nào".
- Cần nội dung riêng theo khung từng sách: Sou Matome (N5–N1), Shinkanzen (N4–N1), TRY! (N5–N1), cộng với Minna và KLL có sẵn.
- Nội dung theo sách **lặp lại** nhiều mục đã có trong kho JLPT chung (cùng mẫu ngữ pháp, cùng chữ kanji).

## Quyết định

1. Thêm enum `Textbook { MINNA KLL SOUMATOME SHINKANZEN TRY }` và cột `textbook` (NULL = kho JLPT chung) trên `Lesson`, `KanjiLesson`.
2. Đánh số bài theo quy ước để không đụng số bài có sẵn (1–50 Minna, 1–32 KLL, 2xx–8xx JLPT):
   `lessonNumber = gốc (SM 20000 / SK 30000 / TRY 40000) + cấp × 1000 (N5=5 … N1=1) + phần × 100 + bài`.
3. Bài của **Sou Matome / Shinkanzen / TRY!** là bản sao theo khung sách → **không tính** vào các truy vấn "theo cấp"
   (bảng kanji JLPT, thi thử, mind map dữ liệu) để khỏi hiện trùng. Minna và KLL là nội dung gốc → vẫn tính.
   Điều kiện dùng chung ở `LEVEL_POOL_LESSON` / `levelPoolSql()`.

## Các phương án đã cân nhắc

| Phương án | Vì sao không chọn |
|-----------|-------------------|
| Bảng nối `TextbookLesson(textbook, lessonId)` trỏ vào bài chung | nội dung theo sách có thứ tự/nhóm riêng (tuần/ngày, chương) không khớp bài chung |
| Cột `section`, `unit` riêng thay vì mã số | tốt hơn về chuẩn hoá, nhưng URL và mọi API hiện dùng `lessonNumber` — đổi quá rộng |
| Không loại khỏi kho theo cấp | bảng kanji N3 hiện mỗi chữ 2–3 lần |

## Hệ quả

- ✅ Chọn sách nào hiện đúng nội dung sách đó; menu nhóm theo sách + cấp.
- ⚠️ **Smart key**: số bài mang ý nghĩa → giới hạn 9 phần × 99 bài; code **không được** suy ngược cấp/sách từ `lessonNumber`
  (dùng cột `textbook`, `jlptLevel`).
- ⚠️ Điều kiện `textbook NOT IN (...)` **phải** kèm `OR textbook IS NULL` — SQL `NOT IN` loại luôn NULL (đã gặp lỗi này).
- ⚠️ Dữ liệu lặp: 3.675 dòng `KanjiEntry` cho 2.222 chữ, và các bản sao bắt đầu lệch nghĩa
  (phân tích + phương án chuẩn hoá: [learn-db-design.md](../learn-db-design.md) mục 5.3).
- ⚠️ Gắn tag Minna/KLL cho dữ liệu có sẵn bằng `UPDATE` trong migration **không chạy được trên DB mới** (bảng còn trống lúc
  migrate) → đã chuyển bước gắn tag vào `seedTextbooks`.
