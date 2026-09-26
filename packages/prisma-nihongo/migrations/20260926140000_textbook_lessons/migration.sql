-- CreateEnum
CREATE TYPE "Textbook" AS ENUM ('MINNA', 'KLL', 'SOUMATOME', 'SHINKANZEN', 'TRY');

-- AlterTable
ALTER TABLE "KanjiLesson" ADD COLUMN     "textbook" "Textbook";

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "textbook" "Textbook";

-- CreateIndex
CREATE INDEX "KanjiLesson_textbook_lessonNumber_idx" ON "KanjiLesson"("textbook", "lessonNumber");

-- CreateIndex
CREATE INDEX "Lesson_textbook_lessonNumber_idx" ON "Lesson"("textbook", "lessonNumber");


-- Gắn giáo trình cho nội dung sẵn có
UPDATE "Lesson" SET "textbook" = 'MINNA' WHERE "lessonNumber" BETWEEN 1 AND 50;
UPDATE "KanjiLesson" SET "textbook" = 'KLL' WHERE "lessonNumber" BETWEEN 1 AND 32;
