-- =============================================================================
-- EDU APP — Chat & Notification (PostgreSQL `nihongo`)
-- Gộp từ Prisma migrations (thứ tự áp dụng):
--   20260627120000_add_chat_notification
--   20260627210000_add_support_chat
--   20260627220000_add_learner_group_chat
-- =============================================================================

-- Migration: 20260627120000_add_chat_notification
-- -----------------------------------------------------------------------------

CREATE TYPE "NotificationType" AS ENUM (
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'SESSION_CONFIRMED',
  'SESSION_CANCELED',
  'SESSION_REMINDER',
  'COACH_MESSAGE',
  'SYSTEM'
);

CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "CoachingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migration: 20260627210000_add_support_chat
-- -----------------------------------------------------------------------------

CREATE TABLE "SupportThread" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupportThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportMessage" (
    "id" SERIAL NOT NULL,
    "threadId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupportThread_userId_key" ON "SupportThread"("userId");
CREATE INDEX "SupportThread_lastMessageAt_idx" ON "SupportThread"("lastMessageAt");
CREATE INDEX "SupportMessage_threadId_createdAt_idx" ON "SupportMessage"("threadId", "createdAt");

ALTER TABLE "SupportThread" ADD CONSTRAINT "SupportThread_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_threadId_fkey"
  FOREIGN KEY ("threadId") REFERENCES "SupportThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SUPPORT_MESSAGE';

-- Migration: 20260627220000_add_learner_group_chat
-- -----------------------------------------------------------------------------

CREATE TYPE "LearnerChatRoomType" AS ENUM ('DIRECT', 'GROUP');
CREATE TYPE "LearnerChatMemberRole" AS ENUM ('MEMBER', 'ADMIN');

ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MESSAGE';

CREATE TABLE "LearnerChatRoom" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "type" "LearnerChatRoomType" NOT NULL DEFAULT 'GROUP',
    "createdById" INTEGER NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LearnerChatRoom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearnerChatMember" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "LearnerChatMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearnerChatMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearnerChatMessage" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearnerChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LearnerChatRoom_lastMessageAt_idx" ON "LearnerChatRoom"("lastMessageAt");
CREATE INDEX "LearnerChatRoom_type_idx" ON "LearnerChatRoom"("type");
CREATE INDEX "LearnerChatMember_userId_idx" ON "LearnerChatMember"("userId");
CREATE UNIQUE INDEX "LearnerChatMember_roomId_userId_key" ON "LearnerChatMember"("roomId", "userId");
CREATE INDEX "LearnerChatMessage_roomId_createdAt_idx" ON "LearnerChatMessage"("roomId", "createdAt");

ALTER TABLE "LearnerChatRoom" ADD CONSTRAINT "LearnerChatRoom_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LearnerChatMember" ADD CONSTRAINT "LearnerChatMember_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "LearnerChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearnerChatMember" ADD CONSTRAINT "LearnerChatMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearnerChatMessage" ADD CONSTRAINT "LearnerChatMessage_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "LearnerChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearnerChatMessage" ADD CONSTRAINT "LearnerChatMessage_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
