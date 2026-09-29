# ADR-0006: Transactional outbox cho event nộp bài thi

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-09-29
- **Phạm vi:** exam-service (`mock-exams.service.ts`, `kafka/`), bảng `OutboxEvent`

## Bối cảnh

Luồng cũ: `submit()` ghi `ExamResult` vào Postgres, sau đó một CQRS event handler gửi `edu.exam.submitted` lên Kafka.
Kiểm chứng trên máy (xem [learn-reliability-patterns.md](../learn-reliability-patterns.md) mục 1):

- Kafka chưa sẵn sàng lúc exam-service khởi động → `producer = null` → **mọi** event bị bỏ im lặng tới khi restart service.
- `send()` lỗi → chỉ ghi log, event mất.
- Service chết giữa lúc ghi DB và lúc gửi → điểm đã lưu, event không bao giờ có.

Đây là lỗi *dual write*: hai hệ thống, không transaction chung.

## Các phương án

| Phương án | Ưu | Nhược |
|-----------|----|-------|
| A. Retry khi gửi + producer tự kết nối lại | đơn giản | vẫn mất event khi process chết giữa chừng |
| B. **Transactional outbox** | không mất event; Kafka lỗi không ảnh hưởng nộp bài | thêm bảng + relay; event trễ ~1s; có thể gửi trùng |
| C. CDC (Debezium đọc WAL Postgres) | không phải viết relay | thêm hạ tầng lớn (Kafka Connect), quá nặng cho project |

## Quyết định

Chọn **B** (kèm luôn A cho producer):

- `ExamResult` và `OutboxEvent` ghi trong **cùng** `prisma.$transaction`; payload có `eventId = exam-result-<id>`, `key = userId`.
- `OutboxRelayService` (exam-service) mỗi giây: `SELECT … FOR UPDATE SKIP LOCKED LIMIT 100` trong transaction → gửi theo
  topic → `publishedAt`; lỗi → `attempts++`, `lastError`; dừng tự thử sau 20 lần.
- `KafkaProducerService` không còn `null` vĩnh viễn: kết nối lười, tự kết nối lại, `send` ném lỗi thay vì nuốt.
- Bỏ handler gửi Kafka trực tiếp.

## Kiểm chứng (2026-09-29, docker compose)

1. Kafka chạy: nộp bài → event lên topic trong ~1s.
2. Tắt Kafka, **restart exam-service**, nộp bài → nộp thành công (201), `ExamResult` lưu, outbox giữ event kèm lỗi.
3. Bật lại Kafka, **không** restart service → relay tự gửi event sau ~12s (5 lần thử). Topic có đủ cả hai event.

## Hệ quả

- ✅ Không mất event khi Kafka lỗi hoặc service chết giữa chừng.
- ✅ Thứ tự theo người học được giữ (cùng `key` → cùng partition).
- ⚠️ **Giao ít nhất một lần**: consumer (chưa có) **bắt buộc** idempotent theo `eventId`.
- ⚠️ Khi Kafka chết, mỗi lượt relay giữ khoá dòng trong vài giây chờ kết nối; lô nhỏ (100) nên chấp nhận được.
- ⚠️ Bảng `OutboxEvent` lớn dần → cần job xoá dòng đã gửi quá 7 ngày; event quá 20 lần thử cần người xem `lastError`
  (chưa có metric/alert — exam-service là gRPC, chưa có `/metrics`).
- Việc tiếp theo: consumer streak/SRS idempotent; áp dụng outbox cho topic khác nếu có.
