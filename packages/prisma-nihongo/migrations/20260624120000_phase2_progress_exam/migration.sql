-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable: rename password -> passwordHash, convert role to enum
ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING (
  CASE WHEN "role" = 'admin' THEN 'ADMIN'::"Role" ELSE 'USER'::"Role" END
);
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "examId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percent" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "sectionScores" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "kana" TEXT NOT NULL,
    "kanji" TEXT,
    "meaning" TEXT NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "wrongCount" INTEGER NOT NULL DEFAULT 1,
    "reviewStreak" INTEGER NOT NULL DEFAULT 0,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListeningLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamResult_userId_idx" ON "ExamResult"("userId");
CREATE INDEX "ExamResult_level_idx" ON "ExamResult"("level");
CREATE INDEX "ReviewLog_userId_mastered_idx" ON "ReviewLog"("userId", "mastered");
CREATE UNIQUE INDEX "ReviewLog_userId_kana_lessonNumber_key" ON "ReviewLog"("userId", "kana", "lessonNumber");
CREATE INDEX "ListeningLog_userId_idx" ON "ListeningLog"("userId");
CREATE UNIQUE INDEX "ListeningLog_userId_date_key" ON "ListeningLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ListeningLog" ADD CONSTRAINT "ListeningLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
