# Database Design — EDU APP

## Tổng quan

| DB | Engine | Port | Dùng bởi |
|----|--------|------|----------|
| `nihongo` | PostgreSQL 16 | 5433 | api-gateway, content-service, exam-service, payment-service |
| `english_learning` | PostgreSQL 16 | 5433 | api-gateway (`english-service` → `EnglishPrismaService`) |
| `nihongo_audit` | MongoDB 7 | 27017 | api-gateway (`AuditInterceptor`) |

PostgreSQL: hai DBs dùng chung một instance, credentials `nihongo:nihongo`.
MongoDB: TTL index 90 ngày trên audit_logs — tự dọn sạch, không cần cron.

---

## DB nihongo

### Sơ đồ quan hệ

```
┌────────────────────────────────────────────────────────────────┐
│ CONTENT                                                         │
│                                                                 │
│  Lesson ──< Vocabulary ──< DictationAttempt                    │
│         ──< Grammar ──< Example                                 │
│         ──< Exercise ──< ExerciseOption (isCorrect Boolean)    │
│                                                                 │
│  KanjiLesson ──< KanjiEntry ──< KanjiVocab                    │
│  KanaSection ──< KanaCell                                      │
│  CounterCategory ──< CounterItem                               │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ JLPT                                                            │
│                                                                 │
│  JlptOrganizer (singleton id=1)                                │
│  JlptExamFeeInfo (singleton id=1)                              │
│  JlptExamBriefing (singleton id=1)                             │
│  JlptExamSession[]  JlptExamVenue[]  JlptExamDaySlot[]        │
│                                                                 │
│  JlptRoadmapLevel ──< JlptRoadmapExamSection                  │
│                   ──< JlptRoadmapMaterial                      │
│                   ──< JlptRoadmapPhase ──< JlptRoadmapTask    │
│  StudyTip[]  JlptRoadmapMeta (singleton id=1)                 │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ STATIC CONTENT                                                  │
│                                                                 │
│  ListeningConfig (singleton)                                   │
│  PodcastResource[]  ListeningPreset[]                         │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ USER & PROGRESS                                                 │
│                                                                 │
│  User ──< SrsCard (contentType + contentId → Vocabulary/Grammar/Kanji)
│       ──< ExamResult ──< ExamSectionResult                    │
│       ──< ListeningLog                                         │
│       ──< StudySession                                         │
│       ──1 StudyStreak                                          │
│       ──< DailyNote                                            │
│       ──< DailyGoal ──< DailyGoalItem                        │
│       ──< RefreshToken                                         │
│                                                                 │
│  ReadingPassage ──< ReadingQuestion ──< ReadingQuestionOption  │
│                 ──< ReadingAttempt                             │
│  DictationAttempt (userId nullable = guest mode)               │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ PAYMENT & MARKETPLACE                                           │
│                                                                 │
│  SubscriptionPlanConfig[]                                      │
│                                                                 │
│  User ──1 Subscription ──< Payment                            │
│       ──1 CoachProfile ──< CoachAvailability                  │
│                        ──< CoachingSession ──1 Payment        │
│                        ──< CoachReview                        │
│                        ──< Payout                             │
│                                                                 │
│  CoachingSession ──1 CoachReview                              │
│                  ──1 Payment (sessionId unique)               │
│                  ──< ChatMessage                              │
│                                                                 │
│  WebhookEvent[] (idempotency log)                             │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ CHAT & NOTIFICATIONS (REST — xem cursor-chat.md, sql/chat-schema.sql) │
│                                                                 │
│  User ──< Notification                                         │
│  User ──1 SupportThread ──< SupportMessage                    │
│  User ──< LearnerChatMember ──> LearnerChatRoom              │
│                              ──< LearnerChatMessage            │
│  CoachingSession ──< ChatMessage  (chưa có UI)                 │
└────────────────────────────────────────────────────────────────┘
```

### Chi tiết bảng quan trọng

#### `SrsCard` — Spaced Repetition SM-2

```
userId      → User.id
contentType → VOCABULARY | GRAMMAR | KANJI
contentId   → Vocabulary.id | Grammar.id | KanjiEntry.id

SM-2 fields:
  easeFactor     Float   default 2.5
  interval       Int     default 0       (ngày)
  repetitions    Int     default 0
  nextReviewAt   DateTime?
  lastReviewedAt DateTime?

Stats:
  correctCount  Int     default 0
  wrongCount    Int     default 0
  reviewStreak  Int     default 0
  mastered      Boolean default false   (true khi interval >= 21)

Unique: (userId, contentType, contentId)
Index:  (userId, nextReviewAt)           — lấy cards cần review hôm nay
Index:  (userId, contentType, mastered)  — lọc theo loại + trạng thái
```

**SM-2 Algorithm:**
```
quality 0-2 (sai/quên):
  interval = 0
  repetitions = 0
  easeFactor không thay đổi

quality 3-5 (đúng):
  if repetitions == 0: interval = 1
  if repetitions == 1: interval = 6
  else: interval = round(interval * easeFactor)
  repetitions += 1
  easeFactor = max(1.3, easeFactor + 0.1 * (quality - 5))

nextReviewAt = now + interval days
mastered = (interval >= 21)
```

#### `Subscription` — Stripe subscription lifecycle

```
userId               → User.id (unique — 1 user 1 subscription)
plan                 → FREE | BASIC | PRO | PRO_ANNUAL
status               → ACTIVE | PAST_DUE | CANCELED | TRIALING | PAUSED
stripeCustomerId     → Stripe Customer ID
stripeSubscriptionId → Stripe Subscription ID (unique)

Index: (stripeCustomerId)  — lookup khi xử lý webhook
Index: (status)            — query active subscribers

Status transitions (via Stripe webhook):
  TRIALING → ACTIVE (sau trial kết thúc + payment success)
  ACTIVE   → PAST_DUE (payment thất bại)
  PAST_DUE → ACTIVE (payment retry thành công)
  ACTIVE   → CANCELED (user cancel hoặc max retry fail)
```

#### `CoachProfile` — Coach marketplace listing

```
userId          → User.id (unique — 1 user 1 coach profile)
hourlyRateUsd   Int (cents: 5000 = $50/hr)
isActive        Boolean default false  — admin approve trước khi hiển thị
avgRating       Float?  — denormalized, cập nhật sau mỗi review
totalSessions   Int     — denormalized, cập nhật sau mỗi COMPLETED session
stripeAccountId String? — Stripe Connect Express account
payoutEnabled   Boolean — true sau khi coach complete Stripe onboarding

Index: (isActive, avgRating)      — search + sort theo rating
Index: (isActive, hourlyRateUsd)  — filter theo giá
```

#### `CoachingSession` — Booking

```
learnerId          → User.id
coachId            → CoachProfile.id
status             → PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELED | NO_SHOW
scheduledAt        DateTime
priceUsdCents      Int  — snapshot tại thời điểm book (tránh thay đổi sau)
platformFeePercent Int  default 20

Conflict check: findFirst WHERE coachId=? AND scheduledAt=? AND status != CANCELED

Index: (learnerId, scheduledAt)  — lịch học của learner
Index: (coachId, scheduledAt)    — lịch dạy của coach
Index: (status, scheduledAt)     — admin overview
```

#### `Payment` — Mọi giao dịch

```
Liên kết với một trong hai (không đồng thời):
  subscriptionId → Subscription.id  (recurring billing)
  sessionId      → CoachingSession.id (unique — 1 session 1 payment)

stripePaymentIntentId String? unique  — idempotency key với Stripe

Status flow:
  PENDING → SUCCEEDED (webhook: payment_intent.succeeded)
  PENDING → FAILED    (webhook: payment_intent.payment_failed)
  SUCCEEDED → REFUNDED (webhook: charge.refunded)
```

#### `Payout` — Coach nhận tiền (Stripe Connect)

```
grossAmountCents = tổng priceUsdCents các sessions trong period
feeAmountCents   = grossAmountCents * platformFeePercent / 100
amountCents      = grossAmountCents - feeAmountCents

stripeTransferId String? unique  — Stripe Transfer ID

Reconciliation:
  platform_profit = SUM(payment.amountCents WHERE SUCCEEDED)
                  - SUM(payout.amountCents WHERE PAID)
```

#### `SubscriptionPlanConfig` — Cấu hình gói (seeded)

```
id              Int      auto-increment
plan            SubscriptionPlan  unique
displayName     String
priceUsdCents   Int
intervalMonths  Int
trialDays       Int
stripePriceId   String?  — Stripe Price ID thực tế (sau khi seed)
features        Json     — mảng String
isActive        Boolean  default true

Dữ liệu seed (sau khi chạy seed-plans.ts):
  FREE       $0          stripePriceId: null
  BASIC      $9.99/mo    stripePriceId: price_1TmsXHR9EzTwyHww08aPARlc  (trial 7d)
  PRO        $19.99/mo   stripePriceId: price_1TmsXIR9EzTwyHwwq8rmK0NB  (trial 7d)
  PRO_ANNUAL $99/yr      stripePriceId: price_1TmsXIR9EzTwyHwwzL0JNQ7e  (trial 14d)
```

#### `ChatMessage` — Tin nhắn coaching session (learner ↔ coach)

```
id          Int        auto-increment
sessionId   → CoachingSession.id  ON DELETE CASCADE
senderId    → User.id
content     String
readAt      DateTime?  — null = chưa đọc
createdAt   DateTime   default now()

Index: (sessionId, createdAt)
```

#### `Notification` — Thông báo in-app (poll REST)

```
id        Int
userId    → User.id  ON DELETE CASCADE
type      NotificationType
title     String
body      String
readAt    DateTime?
metadata  Json?
createdAt DateTime

Index: (userId, readAt, createdAt)
```

#### `SupportThread` + `SupportMessage` — Hỗ trợ user ↔ admin

```
SupportThread:
  id, userId (unique → User), lastMessageAt, createdAt, updatedAt
  Index: (lastMessageAt)

SupportMessage:
  id, threadId → SupportThread, senderId → User
  content, readAt, createdAt
  Index: (threadId, createdAt)
```

#### `LearnerChatRoom` + `LearnerChatMember` + `LearnerChatMessage` — Cộng đồng

```
LearnerChatRoom:
  id, name?, type (DIRECT | GROUP), createdById → User
  lastMessageAt, createdAt, updatedAt
  Index: (lastMessageAt), (type)

LearnerChatMember:
  id, roomId → LearnerChatRoom, userId → User
  role (MEMBER | ADMIN), joinedAt
  Unique: (roomId, userId)
  Index: (userId)

LearnerChatMessage:
  id, roomId, senderId, content, readAt, createdAt
  Index: (roomId, createdAt)
```

SQL đầy đủ: [`docs/sql/chat-schema.sql`](./sql/chat-schema.sql)

#### `WebhookEvent` — Idempotency

```
eventId String unique  — Stripe event ID (e.g. "evt_1ABC...")
Khi nhận webhook:
  1. Check eventId tồn tại với status=PROCESSED → skip
  2. Upsert với status=RECEIVED
  3. Process event
  4. Update status=PROCESSED hoặc FAILED
```

#### `StudyStreak` — Tránh recompute

```
currentStreak  — streak ngày học liên tiếp hiện tại
longestStreak  — kỷ lục từ trước
lastStudyDate  YYYY-MM-DD — so sánh với hôm qua khi update

Logic khi upsert StudySession:
  if lastStudyDate == yesterday: currentStreak += 1
  if lastStudyDate == today: không thay đổi
  else: currentStreak = 1  (reset)
  longestStreak = max(longestStreak, currentStreak)
```

#### `DailyGoal` + `DailyGoalItem`

```
Phiên bản cũ: DailyGoal.items Json  → không query/update từng item
Phiên bản mới:
  DailyGoal ──< DailyGoalItem
                  text      String
                  done      Boolean
                  sortOrder Int

PATCH /daily-goal/:id/items/:itemId chỉ UPDATE 1 row thay vì ghi lại cả mảng JSON.
```

### Enums (nihongo DB)

```
Role:              USER | TEACHER | ADMIN
JlptLevel:         N5 | N4 | N3 | N2 | N1
ExerciseType:      MULTIPLE_CHOICE | FILL_IN_BLANK | LISTENING
ContentType:       VOCABULARY | GRAMMAR | KANJI
KanaScript:        HIRAGANA | KATAKANA
JlptSessionStatus: REGISTRATION_OPEN | REGISTRATION_CLOSED | UPCOMING | PAST
SubscriptionStatus: ACTIVE | PAST_DUE | CANCELED | TRIALING | PAUSED
SubscriptionPlan:  FREE | BASIC | PRO | PRO_ANNUAL
PaymentStatus:     PENDING | SUCCEEDED | FAILED | REFUNDED | PARTIALLY_REFUNDED
SessionStatus:     PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELED | NO_SHOW
PayoutStatus:      PENDING | PROCESSING | PAID | FAILED
WebhookEventStatus: RECEIVED | PROCESSED | FAILED | IGNORED
NotificationType: PAYMENT_SUCCESS | PAYMENT_FAILED | SESSION_CONFIRMED | SESSION_CANCELED
                  | SESSION_REMINDER | COACH_MESSAGE | SUPPORT_MESSAGE | GROUP_MESSAGE | SYSTEM
LearnerChatRoomType:    DIRECT | GROUP
LearnerChatMemberRole:  MEMBER | ADMIN
```

### Migration history (nihongo)

| Tên | Thay đổi chính |
|-----|----------------|
| `20260624_init_postgres` | Schema ban đầu: Lesson, Vocabulary, Grammar, Exercise |
| `20260624_add_kanji` | KanjiLesson, KanjiEntry, KanjiVocab |
| `20260624_add_user_auth` | User, bcrypt password |
| `20260624_phase2_progress` | SrsCard (SM-2), ExamResult, ExamSectionResult |
| `20260625_v2_redesign` | JlptLevel enum, JLPT tables, KanaSection, CounterCategory |
| `20260625_vocab_sort_order` | Vocabulary.sortOrder |
| `20260625_reading_dictation` | ReadingPassage, ReadingQuestion, DictationAttempt |
| `20260626_daily_notes` | DailyNote |
| `20260626_daily_goals` | DailyGoal (items Json — deprecated) |
| `20260627_vocab_image_url` | Vocabulary.imageUrl |
| `20260627_v3_redesign` | **Major**: DailyGoalItem table, SrsCard normalize (xóa snapshot fields), StudyStreak, sortOrder trên tất cả lists, composite indexes, ExerciseOption.isCorrect, DictationAttempt FK |
| `20260627_refresh_token` | RefreshToken table, TEACHER role |
| `20260627_payment_marketplace` | **Major**: Subscription, CoachProfile, CoachingSession, Payment, Payout, WebhookEvent, CoachReview, SubscriptionPlanConfig |
| `seed-plans.ts` | Seed 4 SubscriptionPlanConfig rows + update stripePriceId từ Stripe API |
| `20260627120000_add_chat_notification` | ChatMessage, Notification, NotificationType enum |
| `20260627210000_add_support_chat` | SupportThread, SupportMessage + SUPPORT_MESSAGE enum |
| `20260627220000_add_learner_group_chat` | LearnerChatRoom, LearnerChatMember, LearnerChatMessage + GROUP_MESSAGE enum |

---

## DB english_learning

### Sơ đồ quan hệ

```
┌────────────────────────────────────────────────────────────────┐
│ VOCABULARY                                                      │
│                                                                 │
│  VocabTopic ──< Vocabulary ──< DictationAttempt               │
│                                                                 │
│  SrsCard (contentType=VOCABULARY, contentId=Vocabulary.id)    │
│          (không có FK trực tiếp — polymorphic qua contentId)   │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ GRAMMAR                                                         │
│                                                                 │
│  GrammarTopic ──< GrammarLesson ──< GrammarExample            │
│                                ──< GrammarExercise ──< GrammarExOption (isCorrect)
│                                                                 │
│  SrsCard (contentType=GRAMMAR, contentId=GrammarLesson.id)    │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ READING                                                         │
│                                                                 │
│  ReadingPassage ──< ReadingQuestion ──< ReadingOption         │
│                 ──< ReadingAttempt                            │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ LISTENING                                                       │
│                                                                 │
│  ListeningTrack ──< ListeningQuestion ──< ListeningOption     │
│                 ──< ListeningAttempt                          │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ USER & PROGRESS                                                 │
│                                                                 │
│  User ──< SrsCard                                             │
│       ──< ReadingAttempt (nullable userId = guest mode)       │
│       ──< ListeningAttempt (nullable userId = guest mode)     │
│       ──< DictationAttempt (nullable userId = guest mode)     │
│       ──< StudySession                                        │
│       ──1 StudyStreak                                         │
│       ──< DailyNote                                           │
│       ──< DailyGoal ──< DailyGoalItem                       │
└────────────────────────────────────────────────────────────────┘
```

### Điểm khác biệt so với nihongo DB

| Khía cạnh | nihongo | english |
|-----------|---------|---------|
| Level system | JlptLevel (N5–N1) | EnglishLevel (A1–C2) |
| API access | api-gateway → gRPC | api-gateway → english-service |
| Auth | JWT Bearer (`nihongo.User`) | JWT cookie `aud:english` (`english_learning.User`) |
| Payment / marketplace | Có | Chưa (chỉ học tập) |
| Role | USER / TEACHER / ADMIN | USER / ADMIN |
| Grammar examples | Bảng `Example` | Bảng `GrammarExample` |
| SRS content types | VOCABULARY / GRAMMAR / KANJI | VOCABULARY / GRAMMAR |
| Listening tracking | ListeningLog (thời gian) | ListeningAttempt (câu hỏi) |
| Prisma package | `packages/prisma-nihongo` | `packages/prisma-english` |

### Enums (english DB)

```
Role:         USER | ADMIN
EnglishLevel: A1 | A2 | B1 | B2 | C1 | C2
PartOfSpeech: noun | verb | adjective | adverb | preposition |
              conjunction | pronoun | interjection | phrase | phrasal_verb
ContentType:  VOCABULARY | GRAMMAR
```

### Schema & migrations

Schema: `packages/prisma-english/schema.prisma`  
NestJS client: `packages/nest-prisma-english` → `EnglishPrismaService`  
Env: `ENGLISH_DATABASE_URL`

| Lệnh | Mô tả |
|------|--------|
| `npm run db:push -w @edu/prisma-english` | Sync schema → DB (dev) |
| `npm run seed -w @edu/prisma-english` | Seed dữ liệu mẫu |
| `npm run generate -w @edu/prisma-english` | Generate Prisma Client |

`english-web` **không** còn Prisma client runtime — chỉ UI, gọi API qua gateway.

---

## DB nihongo_audit (MongoDB)

```javascript
// Collection: audit_logs
{
  _id:       ObjectId,
  userId:    Number,      // index
  action:    String,      // index — "marketplace.bookSession"
  resource:  String,      // "marketplace"
  metadata:  Object,      // { method, path, ... }
  ip:        String,
  userAgent: String,
  success:   Boolean,
  durationMs: Number,     // index — performance tracking
  errorMessage: String?,
  createdAt: Date,        // TTL index: 90 ngày (7,776,000 seconds)
}

// Compound indexes:
{ userId: 1, action: 1, createdAt: -1 }
{ createdAt: 1 } expireAfterSeconds: 7776000  // TTL
```

---

## Nguyên tắc thiết kế

### 1. Không dùng Json cho structured data

```
❌ GrammarLesson.examples Json   → ✅ GrammarExample table
❌ GrammarExercise.options Json  → ✅ GrammarExOption table
❌ DailyGoal.items Json          → ✅ DailyGoalItem table
❌ SrsCard.kana/kanji/meaning    → ✅ JOIN sang Vocabulary khi cần
```

Json phù hợp cho: `SubscriptionPlanConfig.features` (unstructured config list), `WebhookEvent.payload` (raw Stripe payload), `Payment.metadata` (optional extra info).

### 2. Denormalization có kiểm soát

```
CoachProfile.avgRating      — tránh AVG(rating) GROUP BY coachId mỗi lần search
CoachProfile.totalSessions  — tránh COUNT(*) mỗi lần hiển thị
SrsCard.mastered            — cache interval >= 21, cập nhật khi review
StudyStreak                 — tránh recompute từ StudySession
```

Chỉ denormalize khi query cost thực sự cao và data đủ ổn định.

### 3. sortOrder trên mọi ordered list

Không dùng `id` hay `createdAt` để sort content. `sortOrder Int default 0` cho phép admin sắp xếp nội dung không phụ thuộc thứ tự insert.

### 4. Composite indexes theo query pattern thực tế

```
(userId, nextReviewAt)           — SRS review queue
(userId, contentType, mastered)  — lọc theo loại + mastery
(lessonId, sortOrder)            — vocab/grammar theo lesson
(isActive, avgRating)            — coach search + sort
(coachId, scheduledAt)           — lịch dạy của coach
(provider, status, createdAt)    — webhook retry queue
```

### 5. Nullable userId = guest mode

`DictationAttempt.userId`, `ReadingAttempt.userId`, `ListeningAttempt.userId` đều nullable. User chưa đăng nhập vẫn luyện tập được, kết quả lưu tạm không gắn account.

### 6. Price in cents (Integer)

Tất cả giá tiền lưu dưới dạng cents (Integer): `hourlyRateUsd: 5000 = $50.00`. Tránh floating point errors khi tính toán tài chính.

### 7. Snapshot pattern cho booking

`CoachingSession.priceUsdCents` lưu giá tại thời điểm book. Khi coach thay đổi giá, các session cũ không bị ảnh hưởng. Tương tự `platformFeePercent` — lưu % tại thời điểm tạo session để reconciliation chính xác.

### 8. Webhook idempotency

`WebhookEvent.eventId` là Stripe event ID (`evt_...`), có UNIQUE constraint. Nếu Stripe gửi lại cùng event (retry), service skip xử lý khi thấy `status = PROCESSED`. Đây là pattern bắt buộc với payment systems.

---

## Backup

Docker phải đang chạy:

```powershell
# Windows (khuyến nghị)
npm run db:backup

# Hoặc thủ công
powershell -NoProfile -ExecutionPolicy Bypass -File infra/backups/backup.ps1
```

```bash
# Linux / macOS / Git Bash
bash infra/backups/backup.sh
```

Script dump 3 file vào [`infra/backups/`](../infra/backups/) (chỉ `*.sql` gitignored):

| File | Nội dung |
|------|----------|
| `nihongo_YYYYMMDD_HHMMSS.sql` | Full data + schema |
| `english_learning_YYYYMMDD_HHMMSS.sql` | Full data + schema |
| `nihongo_schema_YYYYMMDD_HHMMSS.sql` | Schema only |

Chi tiết: [`infra/backups/README.md`](../infra/backups/README.md)

## Apply Migration / Schema

```bash
# Nihongo DB
docker compose up -d postgres
npm run migrate:deploy -w @edu/prisma-nihongo
npm run generate -w @edu/prisma-nihongo

# English DB
npm run db:push -w @edu/prisma-english
npm run seed -w @edu/prisma-english
npm run generate -w @edu/prisma-english
```
