# Note cá nhân — Học gì để lên Senior (từ edu_app)

> Tóm tắt từ [senior-roadmap.md](./senior-roadmap.md). Không học thêm framework mới — học **độ sâu + production judgment + leadership**.

---

## Thứ tự ưu tiên

| # | Học / làm gì | Áp dụng trên edu_app |
|---|--------------|----------------------|
| 1 | **Testing** (unit + integration) — ưu tiên số 1 | Test auth refresh, Stripe webhook idempotent, booking race condition |
| 2 | **PostgreSQL sâu** | `EXPLAIN ANALYZE`, fix N+1, race `bookSession()`, migration expand/contract |
| 3 | **Kafka đúng cách** | Outbox pattern, consumer retry/DLQ, idempotent handler |
| 4 | **Redis nâng cao** | Cache stampede, distributed lock, invalidation strategy |
| 5 | **Stripe production** | Webhook replay, reconciliation job, Connect edge cases |
| 6 | **System design** | Luyện hết Q trong senior-roadmap + sách Alex Xu |
| 7 | **Observability** | Log correlation, metrics p99, tracing gateway → gRPC |
| 8 | **Leadership** | ADR, estimate + push-back PM, review PR như mentor |

## KHÔNG cần học thêm (trừ khi JD bắt)

- Framework mobile thứ 2/3/4
- Angular *và* React cùng lúc nếu target backend
- Kubernetes sâu khi chưa xong testing + DB
- NgRx / Redux "cho đủ"

---

## Checklist 8 tuần

- [ ] Test cho 3 flow nguy hiểm: auth refresh, Stripe webhook, booking conflict
- [ ] 1 PR "senior": fix race / thêm Outbox / thêm metric
- [ ] 1 ADR ngắn: vì sao poll chat thay socket; vì sao LiveKit thay P2P
- [ ] Mock interview 2 buổi/tuần từ [senior-roadmap.md](./senior-roadmap.md) + `interview-*.md` — không nhìn đáp án

Timeline chi tiết theo tuần: cuối [senior-roadmap.md](./senior-roadmap.md) (§ Timeline & Priority).

---

## 3 cuốn sách bắt buộc — link chính thức

> Sách có bản quyền — mua/đọc qua kênh chính thức (không dùng PDF lậu). Giá eBook thường 30–50 USD, O'Reilly/Manning hay sale.

### 1. Designing Data-Intensive Applications — Martin Kleppmann

- O'Reilly (đọc online qua subscription, có trial 10 ngày): https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/
- Trang tác giả (mục lục + tài liệu tham khảo free): https://dataintensive.net/
- Amazon Kindle/paper: https://www.amazon.com/dp/1449373321

### 2. System Design Interview Vol.1 + 2 — Alex Xu

- ByteByteGo (bản online chính chủ, kèm khóa học): https://bytebytego.com/
- Amazon Vol.1: https://www.amazon.com/dp/B08CMF2CQF
- Amazon Vol.2: https://www.amazon.com/dp/1736049119
- Free hợp pháp: blog + newsletter ByteByteGo https://blog.bytebytego.com/ (cover ~70% nội dung sách)

### 3. Unit Testing Principles, Practices, and Patterns — Vladimir Khorikov

- Manning (eBook PDF/ePub chính chủ, hay sale 50%): https://www.manning.com/books/unit-testing
- Amazon: https://www.amazon.com/dp/1617296279
- Free hợp pháp: blog tác giả https://enterprisecraftsmanship.com/ (nhiều chương dạng bài viết)

### Free 100% (đọc kèm)

| Nguồn | Chủ đề |
|-------|--------|
| https://use-the-index-luke.com/ | Database indexing (sách web free) |
| https://github.com/donnemartin/system-design-primer | System design primer |
| https://microservices.io/patterns/ | Outbox, Saga, CQRS patterns |
| https://docs.nestjs.com/ (Fundamentals + Techniques) | NestJS internals |

---

## Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [senior-roadmap.md](./senior-roadmap.md) | Roadmap đầy đủ + 43 Q&A |
| [interview-questions.md](./interview-questions.md) | Câu hỏi phỏng vấn backend |
| [interview-devops.md](./interview-devops.md) | Câu hỏi DevOps |
| [learn-testing.md](./learn-testing.md) | Học testing trên repo |
