-- AlterTable
ALTER TABLE "MockExamTemplate" ADD COLUMN "sourceMode" TEXT NOT NULL DEFAULT 'GENERATED';

ALTER TABLE "MockExamTemplate" ALTER COLUMN "lessonFrom" SET DEFAULT 1;
ALTER TABLE "MockExamTemplate" ALTER COLUMN "lessonTo" SET DEFAULT 1;
ALTER TABLE "MockExamTemplate" ALTER COLUMN "kanjiLessonFrom" SET DEFAULT 1;
ALTER TABLE "MockExamTemplate" ALTER COLUMN "kanjiLessonTo" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "MockExamQuestion" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "sectionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "audioText" TEXT,
    "audioUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamQuestionOption" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MockExamQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MockExamQuestion_templateId_sortOrder_idx" ON "MockExamQuestion"("templateId", "sortOrder");

-- CreateIndex
CREATE INDEX "MockExamQuestionOption_questionId_sortOrder_idx" ON "MockExamQuestionOption"("questionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "MockExamQuestion" ADD CONSTRAINT "MockExamQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MockExamTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamQuestionOption" ADD CONSTRAINT "MockExamQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MockExamQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
