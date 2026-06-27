# Chat & Notification — REST API (không Socket.io)

> Cập nhật: 2026-06-27. App **không còn WebSocket** — chat và thông báo dùng **HTTP REST** + React Query polling.

Schema SQL đầy đủ: [`sql/chat-schema.sql`](./sql/chat-schema.sql)  
Thiết kế DB tổng thể: [`db-design.md`](./db-design.md)

---

## 1. Tổng quan

| Luồng | Bảng | UI | Transport |
|-------|------|-----|-----------|
| Hỗ trợ user ↔ admin | `SupportThread`, `SupportMessage` | `/support`, `/admin/messages` | REST + poll 5–8s |
| Cộng đồng học viên | `LearnerChatRoom`, `LearnerChatMember`, `LearnerChatMessage` | `/community` | REST + poll 5–8s |
| Coaching session | `ChatMessage` | *(chưa có UI)* | REST *(planned)* |
| Thông báo | `Notification` | *(bell planned)* | `GET /api/notifications` |

---

## 2. Schema SQL (tóm tắt)

### 2.1 Support — 1 user = 1 thread

```sql
CREATE TABLE "SupportThread" (
    "id"            SERIAL PRIMARY KEY,
    "userId"        INTEGER NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL
);

CREATE TABLE "SupportMessage" (
    "id"        SERIAL PRIMARY KEY,
    "threadId"  INTEGER NOT NULL REFERENCES "SupportThread"("id") ON DELETE CASCADE,
    "senderId"  INTEGER NOT NULL REFERENCES "User"("id"),
    "content"   TEXT NOT NULL,
    "readAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "SupportMessage_threadId_createdAt_idx"
  ON "SupportMessage"("threadId", "createdAt");
```

### 2.2 Community — group hoặc direct

```sql
CREATE TYPE "LearnerChatRoomType" AS ENUM ('DIRECT', 'GROUP');

CREATE TABLE "LearnerChatRoom" (
    "id"            SERIAL PRIMARY KEY,
    "name"          TEXT,
    "type"          "LearnerChatRoomType" NOT NULL DEFAULT 'GROUP',
    "createdById"   INTEGER NOT NULL REFERENCES "User"("id"),
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL
);

CREATE TABLE "LearnerChatMember" (
    "id"       SERIAL PRIMARY KEY,
    "roomId"   INTEGER NOT NULL REFERENCES "LearnerChatRoom"("id") ON DELETE CASCADE,
    "userId"   INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "role"     "LearnerChatMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("roomId", "userId")
);

CREATE TABLE "LearnerChatMessage" (
    "id"        SERIAL PRIMARY KEY,
    "roomId"    INTEGER NOT NULL REFERENCES "LearnerChatRoom"("id") ON DELETE CASCADE,
    "senderId"  INTEGER NOT NULL REFERENCES "User"("id"),
    "content"   TEXT NOT NULL,
    "readAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 Notification

```sql
CREATE TYPE "NotificationType" AS ENUM (
  'PAYMENT_SUCCESS', 'PAYMENT_FAILED',
  'SESSION_CONFIRMED', 'SESSION_CANCELED', 'SESSION_REMINDER',
  'COACH_MESSAGE', 'SUPPORT_MESSAGE', 'GROUP_MESSAGE', 'SYSTEM'
);

CREATE TABLE "Notification" (
    "id"        SERIAL PRIMARY KEY,
    "userId"    INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type"      "NotificationType" NOT NULL,
    "title"     TEXT NOT NULL,
    "body"      TEXT NOT NULL,
    "metadata"  JSONB,
    "readAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Notification_userId_readAt_createdAt_idx"
  ON "Notification"("userId", "readAt", "createdAt");
```

---

## 3. REST API

Tất cả endpoint yêu cầu `Authorization: Bearer <token>`.

### 3.1 Support (user)

| Method | Path | Mô tả |
|--------|------|--------|
| `GET` | `/api/support` | Thread + 100 tin gần nhất |
| `POST` | `/api/support/messages` | `{ "content": "..." }` |
| `PATCH` | `/api/support/read` | Đánh dấu đã đọc |

### 3.2 Support (admin)

| Method | Path | Mô tả |
|--------|------|--------|
| `GET` | `/api/admin/support/threads` | Danh sách inbox |
| `GET` | `/api/admin/support/threads/:id` | Chi tiết + messages |
| `POST` | `/api/admin/support/threads/:id/messages` | Trả lời |
| `PATCH` | `/api/admin/support/threads/:id/read` | Đánh dấu đã đọc |

### 3.3 Community

| Method | Path | Mô tả |
|--------|------|--------|
| `GET` | `/api/community/rooms` | Phòng của user |
| `GET` | `/api/community/rooms/:id` | Chi tiết + messages |
| `POST` | `/api/community/rooms/group` | `{ "name", "memberIds": [] }` |
| `POST` | `/api/community/rooms/direct` | `{ "userId": 123 }` |
| `POST` | `/api/community/rooms/:id/members` | Thêm thành viên nhóm |
| `POST` | `/api/community/rooms/:id/messages` | Gửi tin |
| `PATCH` | `/api/community/rooms/:id/read` | Đánh dấu đã đọc |
| `GET` | `/api/community/users?q=` | Tìm học viên |

### 3.4 Notifications

| Method | Path | Mô tả |
|--------|------|--------|
| `GET` | `/api/notifications` | 50 thông báo chưa đọc |
| `PATCH` | `/api/notifications/read` | `{ "ids": [1,2,3] }` |

---

## 4. Backend services

```
services/api-gateway/src/realtime/
├── support-chat.service.ts   # SupportThread / SupportMessage
├── group-chat.service.ts     # LearnerChatRoom / Member / Message
├── notification.service.ts   # Persist only (no socket push)
└── realtime.module.ts        # Nest module (không còn gateway)
```

Webhook thanh toán vẫn gọi `NotificationService.send()` — lưu DB, client poll `GET /api/notifications`.

---

## 5. Frontend

| File | Vai trò |
|------|---------|
| `components/SupportChatPanel.tsx` | UI support — gọi REST |
| `components/GroupChatPanel.tsx` | UI community — gọi REST |
| `views/SupportPage.tsx` | `/support` |
| `views/CommunityPage.tsx` | `/community` |
| `views/admin/AdminSupportPage.tsx` | `/admin/messages` |
| `hooks/queries.ts` | `refetchInterval` 5–8s |

**Đã gỡ:** `SocketContext`, `useSocket`, `socket.io-client`, `RealtimeGateway`.

---

## 6. Migrations (Prisma)

| Migration | File |
|-----------|------|
| `20260627120000_add_chat_notification` | `ChatMessage`, `Notification` |
| `20260627210000_add_support_chat` | `SupportThread`, `SupportMessage` + `SUPPORT_MESSAGE` enum |
| `20260627220000_add_learner_group_chat` | `LearnerChatRoom`, `Member`, `Message` + `GROUP_MESSAGE` enum |

```bash
# Dev
docker compose up -d postgres
cd packages/prisma-nihongo
DATABASE_URL=postgresql://nihongo:nihongo@localhost:5433/nihongo npx prisma db push
npm run generate -w @edu/prisma-nihongo

# Production
npm run migrate:deploy -w @edu/prisma-nihongo
```

---

## 7. Luồng gửi tin (support)

```
User → POST /api/support/messages { content }
     → SupportChatService.saveMessage()
     → INSERT SupportMessage
     → UPDATE SupportThread.lastMessageAt
     → NotificationService.send() (nếu admin trả lời → user)

Frontend → optimistic append message
          → refetch GET /api/support sau 8s (polling)
```

---

## 8. Ghi chú thiết kế

- **Direct chat**: `LearnerChatRoom.type = DIRECT`, đúng 2 members; tìm room có sẵn trước khi tạo mới.
- **Group admin**: member `role = ADMIN` mới được `POST .../members`.
- **readAt**: `NULL` = chưa đọc; `markRead` update tất cả tin từ người khác trong thread/room.
- Không dùng Socket.io → giảm tải client, phù hợp chat không cần realtime tức thì.
