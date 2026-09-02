-- CreateTable
CREATE TABLE "MockExamTemplate" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "durationMinutes" INTEGER NOT NULL,
    "lessonFrom" INTEGER NOT NULL,
    "lessonTo" INTEGER NOT NULL,
    "kanjiLessonFrom" INTEGER NOT NULL,
    "kanjiLessonTo" INTEGER NOT NULL,
    "vocabCount" INTEGER NOT NULL DEFAULT 12,
    "grammarCount" INTEGER NOT NULL DEFAULT 10,
    "kanjiCount" INTEGER NOT NULL DEFAULT 5,
    "listeningWordCount" INTEGER NOT NULL DEFAULT 4,
    "listeningSentenceCount" INTEGER NOT NULL DEFAULT 4,
    "passThreshold" INTEGER NOT NULL DEFAULT 65,
    "scope" TEXT NOT NULL DEFAULT '',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockExamTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MockExamTemplate_slug_key" ON "MockExamTemplate"("slug");

-- CreateIndex
CREATE INDEX "MockExamTemplate_level_sortOrder_idx" ON "MockExamTemplate"("level", "sortOrder");

-- CreateIndex
CREATE INDEX "MockExamTemplate_isPublished_sortOrder_idx" ON "MockExamTemplate"("isPublished", "sortOrder");
