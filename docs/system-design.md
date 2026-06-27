# System Design — EDU APP

## 1. Kiến trúc tổng thể

Hai frontend (nihongo-web, english-web) đều là **thin client**. Không có Route Handler gọi DB trực tiếp — mọi API đi qua `api-gateway`.

```
                              Internet
                                  │
                    ┌─────────────▼──────────────┐
                    │           Nginx             │
                    │   Reverse Proxy / SSL       │
                    └──────┬──────────┬───────────┘
                           │          │
              ┌────────────▼──┐   ┌───▼────────────────┐
              │  nihongo-web  │   │    english-web       │
              │  Next.js:5173 │   │    Next.js :3001     │
              └───────┬───────┘   └──────────┬───────────┘
                      │ rewrite /api/*        │ rewrite /api/* → /api/english/*
                      └──────────┬────────────┘
                                 ▼
                    ┌────────────────────────────┐
                    │        api-gateway           │
                    │        NestJS :3000          │
                    │  REST (chat, notifications)  │
                    │  Swagger /api/docs           │
                    └──┬─────────────────────┬───┘
                       │ gRPC                │ in-process modules
           ┌───────────▼────────┐    ┌───────▼────────────────────────────┐
           │  content-service    │    │  english-service (/api/english/*)   │
           │  gRPC :50051        │    │  payment-service (Stripe/marketplace)│
           │  exam-service       │    │  realtime-module (chat services)    │
           │  gRPC :50052        │    └─────────────────────────────────────┘
           └────────────────────┘

   ┌─────────────────────────────────────────────────────────┐
   │                      Data Layer                         │
   │                                                         │
   │  PostgreSQL :5433          MongoDB :27017               │
   │  ├── nihongo                 └── nihongo_audit           │
   │  └── english_learning            audit_logs (TTL 90d)   │
   │                                                         │
   │  Redis :6379                                            │
   │  ├── cache (vocab, coach search)                        │
   │  └── sliding-window rate limit                          │
   └─────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────┐
   │                    Async Layer (Kafka)                  │
   │  edu.exam.submitted      edu.payment.succeeded          │
   │  edu.session.completed   edu.vocab.reviewed             │
   └─────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────┐
   │                  External Services                      │
   │  Stripe Payments │ Stripe Connect │ AWS S3              │
   └─────────────────────────────────────────────────────────┘
```

> Chat & notification: REST + React Query polling (5–8s). Chi tiết: [`cursor-chat.md`](./cursor-chat.md).

---

## 2. Services

### api-gateway (NestJS :3000)

Entry point HTTP duy nhất. Không còn WebSocket.

| Trách nhiệm | Chi tiết |
|-------------|----------|
| Auth (nihongo) | JWT Bearer + refresh token rotation + Google OAuth |
| Auth (english) | JWT `aud: english` + HttpOnly cookie `token` |
| gRPC dispatch | Nihongo → content-service, exam-service |
| English API | `english-service` in-process → `english_learning` |
| Payment | `payment-service` — Stripe, marketplace, webhook |
| Upload | S3 pre-signed URL |
| Audit | `AuditInterceptor` → MongoDB |
| Rate limit | Redis sliding window trên auth endpoints |
| Chat | `realtime-module` — support, community, notifications (REST) |

#### Route map — Nihongo (`/api/*`)

| Route group | Mô tả |
|-------------|-------|
| `POST /api/auth/*` | Login, register, refresh, Google OAuth |
| `GET /api/vocabularies/*` | content-service (gRPC) |
| `GET /api/grammars/*` | content-service (gRPC) |
| `GET /api/lessons/*` | content-service (gRPC) |
| `POST /api/mock-exams/*` | exam-service (gRPC) |
| `GET /api/progress/*` | exam-service (gRPC) |
| `GET/POST /api/subscriptions/*` | payment-service — Stripe subscription |
| `GET/POST /api/marketplace/*` | payment-service — booking, coach search |
| `GET/PATCH /api/notifications/*` | Notification history (DB poll) |
| `GET/POST /api/support/*` | Support chat user ↔ admin |
| `GET/POST /api/community/*` | Learner group / direct chat |
| `GET/POST /api/admin/support/*` | Admin inbox support |
| `POST /api/upload/presigned-url` | AWS S3 |
| `POST /api/webhooks/stripe` | payment-service — idempotent webhook |

#### Route map — English (`/api/english/*`)

| Route | Mô tả |
|-------|--------|
| `POST /api/english/auth/login` | Login, set HttpOnly cookie |
| `GET /api/english/vocab` | Từ vựng + SRS map |
| `GET/POST /api/english/vocab/review` | SRS review queue |
| `GET /api/english/grammar/:id` | Grammar + lessons |
| `GET/POST /api/english/reading/:id/submit` | Đọc hiểu |
| `GET/POST /api/english/listening/:id/submit` | Nghe |
| `GET /api/english/analytics` | Thống kê học tập |

### content-service (gRPC :50051)

Nội dung tiếng Nhật: Lesson, Vocabulary, Grammar, Kanji, Kana, JLPT, Reading, Listening.

### exam-service (gRPC :50052)

Mock exam JLPT, SRS, progress, study streak.

### english-service (in-process)

Logic học tiếng Anh, kết nối `english_learning` qua `EnglishPrismaService`.

### payment-service (in-process)

Stripe subscription lifecycle, coaching marketplace, webhook idempotent, coach payout qua Stripe Connect.

### realtime-module (in-process trong api-gateway)

Services lưu/đọc PostgreSQL — **không có Socket.io gateway**:

1. **SupportChatService** — `SupportThread`, `SupportMessage` → `/api/support`, `/api/admin/support`
2. **GroupChatService** — `LearnerChatRoom`, member, message → `/api/community`
3. **NotificationService** — persist `Notification` (webhook payment, tin nhắn mới)

Frontend poll `refetchInterval` 5–8s qua React Query.

---

## 3. Request Flows

### 3.1 Học vocab (nihongo-web)

```
Browser → GET /api/vocabularies?lessonNumber=1  (Bearer token)
        → JwtAuthGuard → gRPC content-service
        → PostgreSQL nihongo + Redis cache (TTL 5 phút)
        → AuditInterceptor → MongoDB
```

### 3.2 Thanh toán subscription

```
Browser → POST /api/subscriptions { plan: 'PRO' }
        → JwtAuthGuard
        → SubscriptionService.createOrUpgrade()
           ├── check SubscriptionPlanConfig.stripePriceId
           ├── Stripe.createCustomer (nếu chưa có)
           └── Stripe.createSubscription → trả clientSecret
        → Browser: Stripe Elements nhập card → confirmPayment()
        → Stripe → POST /api/webhooks/stripe (payment_intent.succeeded)
        → WebhookService (idempotent) → UPDATE Payment, Subscription
        → NotificationService.send() → INSERT Notification (client poll GET /api/notifications)
```

### 3.3 Book coaching session

```
Browser → POST /api/marketplace/sessions { coachId, scheduledAt }
        → JwtAuthGuard
        → BookingService:
           ├── check coach.isActive
           ├── check conflict slot
           ├── $transaction: CREATE CoachingSession + Payment
           └── Stripe.createPaymentIntent() → clientSecret
        → Return { session, clientSecret }
```

### 3.4 Support chat (user ↔ admin)

```
Browser → GET /api/support
        → JwtAuthGuard → SupportChatService.getOrCreateThread()
        → PostgreSQL SupportThread + SupportMessage

Browser → POST /api/support/messages { content }
        → saveMessage() → UPDATE lastMessageAt
        → NotificationService (admin nhận SUPPORT_MESSAGE)

Frontend → refetch mỗi 5–8s (React Query)
```

### 3.5 Community chat (học viên)

```
Browser → GET /api/community/rooms
Browser → POST /api/community/rooms/:id/messages { content }
        → GroupChatService → LearnerChatMessage
        → notify members (GROUP_MESSAGE notification)

Direct: POST /api/community/rooms/direct { userId } — tái sử dụng room DIRECT nếu đã có
```

### 3.6 Auth — Nihongo

```
POST /api/auth/login → access_token (15m) + refresh_token (cookie 7d, DB)
POST /api/auth/google → verify Google ID token → upsert User → tokens
GET  /api/*           → Authorization: Bearer <access_token>
POST /api/auth/refresh → rotate refresh token
```

---

## 4. Authentication Design

| | nihongo-web | english-web |
|---|---|---|
| Token | Bearer access_token | HttpOnly cookie `token` |
| JWT `aud` | (không có) | `"english"` |
| Refresh | Rotation (DB) | Re-login (30d JWT) |
| Guard | JwtAuthGuard | EnglishAuthGuard |
| User DB | `nihongo.User` | `english_learning.User` |
| Google OAuth | Có | Không |

---

## 5. Rate Limiting

Redis sliding window (`SlidingWindowRateLimitGuard`):

```
POST /api/auth/login     → 5 req / 60s   (key: rl:{ip}:auth:login)
POST /api/auth/register  → 3 req / 3600s
```

---

## 6. Audit Logging

`AuditInterceptor` — mọi authenticated nihongo request:

```javascript
// MongoDB collection: audit_logs (TTL 90 ngày)
{ userId, action, resource, metadata, ip, success, durationMs, createdAt }
```

---

## 7. Caching Strategy

| Data | TTL | Store |
|------|-----|-------|
| Nihongo vocab by lesson | 5 phút | Redis |
| Coach search | 1 phút | Redis |
| English vocab | Không | — |

---

## 8. Kafka Topics

| Topic | Producer | Mục đích |
|-------|----------|----------|
| `edu.exam.submitted` | exam-service | Async scoring |
| `edu.payment.succeeded` | payment-service | Trigger payout |
| `edu.session.completed` | payment-service | Coach stats update |
| `edu.vocab.reviewed` | exam-service | Study streak |

---

## 9. Infrastructure

Docker Compose: `postgres`, `redis`, `mongodb`, `kafka`, `zookeeper`, `api-gateway`, `content-service`, `exam-service`, `nihongo-web`, `english-web`, `nginx`

Kubernetes: `infra/k8s/`, `infra/helm/edu-app/`

CI/CD: `.github/workflows/`

---

## 10. Điểm mạnh / hạn chế

| | Nhận xét |
|---|---|
| ✅ Unified gateway | Cả hai app qua 1 entry point |
| ✅ DB tách biệt | nihongo vs english_learning, user độc lập |
| ✅ gRPC + in-process | Microservices cho nihongo, modules cho english/payment |
| ✅ Stripe subscription + Connect | Full payment lifecycle + coach payout |
| ✅ REST chat | Support + community, polling nhẹ (không socket) |
| ✅ Google OAuth | Đăng nhập Gmail (nihongo-web) |
| ✅ Audit + rate limit | MongoDB audit, Redis sliding window |
| ⚠️ Chat text only | Chưa hỗ trợ file/image |
| ⚠️ Không realtime tức thì | Poll 5–8s thay vì push |
| ⚠️ Coaching session chat | Bảng `ChatMessage` có, chưa có UI/API |
| ⚠️ Hai user DB riêng | Không SSO giữa 2 app |
