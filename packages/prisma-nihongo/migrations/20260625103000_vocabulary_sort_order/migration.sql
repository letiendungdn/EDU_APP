-- AlterTable
ALTER TABLE "Vocabulary" ADD COLUMN "sortOrder" INTEGER;

-- CreateIndex
CREATE INDEX "Vocabulary_lessonId_sortOrder_idx" ON "Vocabulary"("lessonId", "sortOrder");
