-- DropIndex
DROP INDEX "DailyActivity_userId_date_idx";

-- DropIndex
DROP INDEX "DailyGoal_userId_date_idx";

-- DropIndex
DROP INDEX "DailyNote_userId_date_idx";

-- DropIndex
DROP INDEX "KanaCell_sectionId_idx";

-- DropIndex
DROP INDEX "ListeningLog_userId_date_idx";

-- DropIndex
DROP INDEX "StudySession_userId_date_idx";

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" SERIAL NOT NULL,
    "topic" TEXT NOT NULL,
    "key" TEXT,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutboxEvent_publishedAt_id_idx" ON "OutboxEvent"("publishedAt", "id");

