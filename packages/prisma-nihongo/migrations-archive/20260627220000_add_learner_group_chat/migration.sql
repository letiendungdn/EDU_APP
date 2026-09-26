-- CreateEnum
CREATE TYPE "LearnerChatRoomType" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "LearnerChatMemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_MESSAGE';

-- CreateTable
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

-- CreateTable
CREATE TABLE "LearnerChatMember" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "LearnerChatMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerChatMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerChatMessage" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearnerChatRoom_lastMessageAt_idx" ON "LearnerChatRoom"("lastMessageAt");

-- CreateIndex
CREATE INDEX "LearnerChatRoom_type_idx" ON "LearnerChatRoom"("type");

-- CreateIndex
CREATE INDEX "LearnerChatMember_userId_idx" ON "LearnerChatMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerChatMember_roomId_userId_key" ON "LearnerChatMember"("roomId", "userId");

-- CreateIndex
CREATE INDEX "LearnerChatMessage_roomId_createdAt_idx" ON "LearnerChatMessage"("roomId", "createdAt");

-- AddForeignKey
ALTER TABLE "LearnerChatRoom" ADD CONSTRAINT "LearnerChatRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerChatMember" ADD CONSTRAINT "LearnerChatMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "LearnerChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerChatMember" ADD CONSTRAINT "LearnerChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerChatMessage" ADD CONSTRAINT "LearnerChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "LearnerChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerChatMessage" ADD CONSTRAINT "LearnerChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
