-- Add fileUrl and fileType to chat message models

ALTER TABLE "ChatMessage" ADD COLUMN "fileUrl" TEXT;
ALTER TABLE "ChatMessage" ADD COLUMN "fileType" TEXT;

ALTER TABLE "SupportMessage" ADD COLUMN "fileUrl" TEXT;
ALTER TABLE "SupportMessage" ADD COLUMN "fileType" TEXT;

ALTER TABLE "LearnerChatMessage" ADD COLUMN "fileUrl" TEXT;
ALTER TABLE "LearnerChatMessage" ADD COLUMN "fileType" TEXT;
