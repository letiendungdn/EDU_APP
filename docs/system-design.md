# System Design — EDU APP

## 1. Kiến trúc tổng thể

Frontend là **thin client** (Next.js, Angular, mobile). Không Route Handler gọi DB trực tiếp — mọi API đi qua `api-gateway`. Edge Docker: **nginx :8080** (web + Keycloak + `/api`).

```
                              Internet / Emulator (10.0.2.2)
                                  │
                    ┌─────────────▼──────────────┐
                    │     Nginx :8080 (Docker)    │
                    │  host/path → web|auth|api   │
                    └──────┬───────┬──────┬───────┘
                           │       │      │
              ┌────────────▼──┐ ┌──▼───┐ ┌▼──────────────┐
              │  nihongo-web  │ │angular│ │ english-web   │
              │  Next.js      │ │ :5174 │ │ Next (profile)│
              └───────┬───────┘ └──┬───┘ └──────┬────────┘
                      │            │             │
                      └────────────┼─────────────┘
                                   ▼
                    ┌────────────────────────────┐
                    │        api-gateway :3000     │
                    │  REST + Swagger /api/docs    │
                    │  JWT + Keycloak OIDC verify  │
                    └──┬──────────┬──────────┬───┘
                       │ gRPC     │          │
           ┌───────────▼──┐  ┌────▼────┐ ┌───▼──────────┐
           │ content :50051│  │exam:50052│ │ in-process:  │
           │ exam :50052   │  │          │ │ payment, EN, │
           └───────────────┘  └──────────┘ │ chat REST    │
                                           └──────────────┘

   Auth: Keycloak (realm edu-app) ←→ postgres-keycloak
   Live: LiveKit :7880 (livestream) │ Signaling :3002 (1-1 WebRTC, tùy chọn)

   Data: PostgreSQL nihongo :5433 │ english_learning :5434
         MongoDB audit :27017 │ Redis :6379 │ Kafka
   External: Stripe │ Brevo │ AWS S3 │ Google OAuth
```

> Chat & notification: REST + React Query polling (5–8s). Chi tiết: [`cursor-chat.md`](./cursor-chat.md) *(archival prompt — API đã ship)*.  
> Nginx routing: [nginx.md](./nginx.md). Docker services: [docker.md](./docker.md).

---

## 2. Services

### api-gateway (NestJS :3000)

Entry point HTTP. Chat hỗ trợ/community là REST (không Socket.io gateway cho chat).

| Trách nhiệm | Chi tiết |
|-------------|----------|
| Auth (nihongo) | JWT Bearer + refresh + Google OAuth + **Keycloak OIDC** |
| Auth (english) | JWT `aud: english` + HttpOnly cookie `token` |
| gRPC dispatch | → content-service, exam-service |
| English API | `english-service` in-process → `english_learning` |
| Payment | Stripe, marketplace, webhook |
| Live | LiveKit token / session (`/api/live/*`) |
| Upload | S3 pre-signed URL |
| Audit | `AuditInterceptor` → MongoDB |
| Rate limit | Redis sliding window trên auth |
| Chat | support, community, notifications (REST) |

#### Route map — Nihongo (`/api/*`)

| Route group | Mô tả |
|-------------|-------|
| `POST /api/auth/*` | Login, register, refresh, Google, OIDC |
| `GET /api/vocabularies/*` | content-service (gRPC) |
| `GET /api/grammars/*` | content-service (gRPC) |
| `GET /api/lessons/*` | content-service (gRPC) |
| `POST /api/mock-exams/*` | exam-service (gRPC) |
| `GET /api/progress/*` | Progress / SRS sync |
| `GET/POST /api/live/*` | LiveKit livestream sessions |
| `GET/POST /api/subscriptions/*` | Stripe subscription |
| `GET/POST /api/marketplace/*` | Booking, coach search |
| `GET/PATCH /api/notifications/*` | Notification history |
| `GET/POST /api/support/*` | Support chat user ↔ admin |
| `GET/POST /api/community/*` | Learner group / direct chat |
| `POST /api/push/*` | Đăng ký APNs/FCM device token |
| `POST /api/upload/presigned-url` | AWS S3 |
| `POST /api/webhooks/stripe` | Idempotent webhook |

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

Logic học tiếng Anh → `english_learning` qua `EnglishPrismaService`.

### payment-service (in-process)

Stripe subscription, marketplace booking, webhook idempotent, Stripe Connect payout.

### realtime-module (in-process)

Support / community / notifications — **REST + poll**, không Socket.io chat gateway.

### keycloak

OIDC IdP (`realm edu-app`). Public URL: `http://auth.localhost:8080`. Clients: `nihongo-web`, `nihongo-mobile`, `nihongo-angular`, …

### livekit

SFU livestream (`edu-livekit :7880`). Gateway cấp token; mobile/web join room.

### signaling-service (:3002)

WebSocket WebRTC **1-1 call** (tùy chọn) — khác livestream LiveKit.

### Clients

| App | Stack | Ghi chú |
|-----|-------|---------|
| `nihongo-web` | Next.js | App chính |
| `nihongo-angular` | Angular 19 | Feature gần parity web |
| `english-web` | Next.js | Profile `english` |
| 4 mobile | Expo / Android / Flutter / iOS | [mobile-tech-stacks.md](./mobile-tech-stacks.md) |

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

| | nihongo-web / Angular / mobile | english-web |
|---|---|---|
| Token | Bearer access_token | HttpOnly cookie `token` |
| JWT `aud` | (không có) / OIDC từ Keycloak | `"english"` |
| Refresh | Rotation (DB) | Re-login (30d JWT) |
| Guard | JwtAuthGuard (+ OIDC verify) | EnglishAuthGuard |
| User DB | `nihongo.User` | `english_learning.User` |
| Google OAuth | Có | Không |
| Keycloak OIDC | Có (`oidc-client-ts` trên Angular/web) | Không |

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

Docker Compose (Nihongo full ≈14 container): `postgres-nihongo`, `postgres-keycloak`, `keycloak`, `redis`, `mongodb`, `kafka`, `zookeeper`, `livekit`, `api-gateway`, `content-service`, `exam-service`, `nihongo-web`, `nihongo-angular`, `nginx`. Profile `english`: thêm `postgres-english` + `english-web`. Chi tiết: [docker.md](./docker.md).

Kubernetes: `infra/k8s/`, `infra/helm/edu-app/`

CI/CD: `.github/workflows/`

---

## 10. Điểm mạnh / hạn chế

| | Nhận xét |
|---|---|
| ✅ Unified gateway | Web + Angular + mobile qua 1 entry (nginx/API) |
| ✅ DB tách biệt | nihongo vs english_learning, user độc lập |
| ✅ gRPC + in-process | Microservices nihongo; English/payment in-process |
| ✅ Stripe + Connect | Subscription + coach payout |
| ✅ LiveKit + Keycloak | Livestream SFU + OIDC IdP |
| ✅ REST chat | Support + community, polling nhẹ |
| ✅ Google OAuth + OIDC | Gmail + Keycloak |
| ✅ Audit + rate limit | MongoDB audit, Redis sliding window |
| ⚠️ Chat text only | Chưa hỗ trợ file/image |
| ⚠️ Không realtime tức thì | Poll 5–8s thay vì push (chat) |
| ⚠️ Coaching session chat | Bảng `ChatMessage` có, chưa có UI/API |
| ⚠️ Hai user DB riêng | Không SSO giữa nihongo ↔ english app |
