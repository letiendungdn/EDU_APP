# EDU APP — Language Coaching Platform

Nền tảng học ngôn ngữ kết hợp coaching marketplace: học tiếng Nhật (nihongo-web) và tiếng Anh (english-web), cho phép learner mua subscription, đặt lịch học 1-on-1 với coach, chat real-time và thanh toán qua Stripe.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, TailwindCSS |
| Backend | NestJS 11, Node.js 22 |
| Inter-service | gRPC (Protocol Buffers) + in-process modules |
| Databases | PostgreSQL 16 (Prisma 6), MongoDB 7 (Mongoose) |
| Cache / Session | Redis 7 (ioredis + cache-manager) |
| Real-time | Socket.io (notifications, chat, presence, live scoring) |
| Payments | Stripe (Subscriptions + Connect payout) |
| Events | Kafka (confluent-cp 7.6) |
| File Storage | AWS S3 (pre-signed URL upload) |
| Auth | JWT Bearer (nihongo) + JWT cookie `aud:english` (english) + Google OAuth |
| Container | Docker Compose, Kubernetes (Helm) |
| CI/CD | GitHub Actions |

## Kiến trúc tổng quan

```
                              Internet
                                  │
                    ┌─────────────▼─────────────┐
                    │          Nginx             │
                    │    (reverse proxy / SSL)   │
                    └──────┬──────────┬─────────┘
                           │          │
              ┌────────────▼──┐   ┌───▼──────────────┐
              │  nihongo-web  │   │   english-web     │
              │  Next.js:5173 │   │  Next.js :3001    │
              └───────┬───────┘   └─────────┬─────────┘
                      │ rewrite /api/*       │ rewrite /api/* → /api/english/*
                      └──────────┬────────────┘
                                 ▼
                    ┌────────────────────────────┐
                    │        api-gateway          │
                    │        NestJS :3000         │
                    │  REST + Socket.io /realtime │
                    │  Swagger: /api/docs         │
                    └──┬─────────────┬───────────┘
                       │ gRPC        │ in-process modules
           ┌───────────▼──┐    ┌─────▼──────────────────────────────┐
           │ content-svc  │    │ english-service  (/api/english/*)   │
           │   :50051     │    │ payment-service  (Stripe/marketplace)│
           │ exam-svc     │    │ realtime-module  (Socket.io gateway) │
           │   :50052     │    └─────────────────────────────────────┘
           └──────────────┘

    ┌──────────────────────────────────────────────────────────┐
    │                      Data Layer                          │
    │  PostgreSQL :5433   │  MongoDB :27017   │  Redis :6379   │
    │  nihongo            │  nihongo_audit    │  cache         │
    │  english_learning   │  (TTL 90 ngày)    │  rate-limit    │
    │                     │                   │  presence      │
    └──────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────┐
    │               Async Layer (Kafka :9092)                  │
    │  edu.exam.submitted   │  edu.payment.succeeded           │
    │  edu.session.completed│  edu.vocab.reviewed              │
    └──────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────┐
    │              Real-time Layer (Socket.io /realtime)       │
    │  notification        │  chat:message    │  heartbeat     │
    │  coaches:online-list │  exam:scored     │  coach:busy    │
    └──────────────────────────────────────────────────────────┘
```

## Cấu trúc thư mục

```
edu_app/
├── apps/
│   ├── nihongo-web/           # Next.js — học tiếng Nhật (:5173)
│   └── english-web/           # Next.js — học tiếng Anh (:3001)
├── services/
│   ├── api-gateway/           # HTTP :3000 + Socket.io /realtime
│   │   └── src/realtime/      # RealtimeGateway, NotificationService, ChatService
│   ├── content-service/       # gRPC :50051 (vocab, grammar, lesson)
│   ├── exam-service/          # gRPC :50052 (mock exam, SRS, progress)
│   ├── english-service/       # /api/english/* → english_learning DB
│   └── payment-service/       # Stripe subscription + booking + payout
├── packages/
│   ├── nest-common/           # Guards, interceptors, audit, rate-limit
│   ├── nest-contracts/        # gRPC DTOs, Kafka topic constants
│   ├── nest-prisma/           # PrismaModule (nihongo)
│   ├── nest-prisma-english/   # EnglishPrismaModule (english_learning)
│   ├── prisma-nihongo/        # Schema + migrations (DB nihongo)
│   └── prisma-english/        # Schema + seed (DB english_learning)
├── infra/                     # K8s, Helm, Nginx, k6, backups
│   └── backups/               # backup.ps1, backup.sh, SQL dumps (*.sql gitignored)
├── docs/
│   ├── system-design.md       # Kiến trúc chi tiết, request flows
│   ├── db-design.md           # ER diagrams, schema reference
│   ├── run-local.md           # Hướng dẫn chạy local
│   ├── google-oauth-setup.md  # Cấu hình Google Sign-In
│   ├── cursor-everfit-prep.md # Cursor prompt: Payment + Marketplace
│   ├── cursor-chat.md         # Cursor: REST chat + notification
│   ├── sql/chat-schema.sql    # DDL chat (gộp migrations)
│   └── senior-roadmap.md      # Lộ trình lên Senior + Q&A
├── docker-compose.yml
└── package.json
```

## Chạy development

Chi tiết từng terminal: **[docs/run-local.md](docs/run-local.md)**

```bash
npm install

# Infrastructure
docker compose up -d postgres redis mongodb kafka zookeeper

# Backend (mỗi terminal)
npm run dev:gateway      # http://localhost:3000
npm run dev:content      # gRPC :50051
npm run dev:exam         # gRPC :50052

# Frontend
npm run dev:nihongo-web  # http://localhost:5173
npm run dev:english-web  # http://localhost:3001

# Stripe webhook (terminal riêng, khi test thanh toán)
npm run stripe:listen
```

## Tính năng chính

### Nihongo (tiếng Nhật)
- Từ vựng, ngữ pháp, kanji theo bài Minna no Nihongo
- SRS flashcard (SM-2 algorithm)
- Thi thử JLPT N5–N1, quiz, đọc hiểu, nghe chép
- Streak học tập, analytics

### Subscription & Marketplace
| Plan | Giá | Nội dung |
|------|-----|----------|
| Free | $0 | Bài 1–10, Kana, Quiz |
| Basic | $9.99/tháng | Bài 1–25, Kanji N5–N4, SRS, thi thử N5–N4 |
| Pro | $19.99/tháng | Toàn bộ + coach 1-on-1 |
| Pro Annual | $99/năm | Pro + ưu tiên booking |

Thanh toán qua Stripe Elements (card). Coach nhận payout qua Stripe Connect.

### Chat & Notification (REST)
- **Support**: user ↔ admin tại `/support`, `/admin/messages`
- **Community**: nhóm & chat 1:1 học viên tại `/community`
- **Notification**: lưu DB, client poll `GET /api/notifications`

## API Docs

Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Database

```bash
# Nihongo DB — migrate + seed plans
docker compose up -d postgres
npm run migrate:deploy -w @edu/prisma-nihongo

# English DB
npm run db:push -w @edu/prisma-english
npm run seed -w @edu/prisma-english
```

### Backup

```powershell
npm run db:backup
# hoặc: bash infra/backups/backup.sh
```

Dump vào `infra/backups/` — xem [infra/backups/README.md](infra/backups/README.md).

## Environment Variables

**`services/.env`**:
```env
DATABASE_URL=postgresql://nihongo:nihongo@localhost:5433/nihongo
ENGLISH_DATABASE_URL=postgresql://nihongo:nihongo@localhost:5433/english_learning
MONGODB_URL=mongodb://localhost:27017/nihongo_audit
KAFKA_BROKERS=localhost:9092
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=edu-app-dev
```

**`apps/nihongo-web/.env`**:
```env
API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ENGLISH_APP_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Tests

```bash
npm test -w @edu/nihongo-services
npm test -- --coverage -w @edu/nihongo-services
```

## Tài liệu

| File | Nội dung |
|------|----------|
| [docs/system-design.md](docs/system-design.md) | Kiến trúc, request flows, auth |
| [docs/db-design.md](docs/db-design.md) | ER diagrams, schema reference, backup |
| [docs/run-local.md](docs/run-local.md) | Hướng dẫn chạy local từng bước |
| [docs/google-oauth-setup.md](docs/google-oauth-setup.md) | Cấu hình Google Sign-In |
| [docs/cursor-everfit-prep.md](docs/cursor-everfit-prep.md) | Cursor: Payment + Marketplace |
| [docs/cursor-chat.md](docs/cursor-chat.md) | Cursor: REST chat + notification |
| [docs/sql/chat-schema.sql](docs/sql/chat-schema.sql) | DDL chat (gộp migrations) |
| [docs/senior-roadmap.md](docs/senior-roadmap.md) | Lộ trình Senior + 43 Q&A |
