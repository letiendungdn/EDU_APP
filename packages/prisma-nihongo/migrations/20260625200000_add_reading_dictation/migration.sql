-- Migration: add_reading_dictation
-- Thêm tính năng đọc hiểu (Reading) và nghe chép chính tả (Dictation)

-- ─── ReadingPassage ───────────────────────────────────────────
CREATE TABLE "ReadingPassage" (
    "id"           SERIAL           NOT NULL,
    "title"        TEXT             NOT NULL,
    "content"      TEXT             NOT NULL,
    "jlptLevel"    "JlptLevel",
    "source"       TEXT,
    "estimatedMin" INTEGER          NOT NULL DEFAULT 3,
    "sortOrder"    INTEGER          NOT NULL DEFAULT 0,
    "createdAt"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadingPassage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ReadingPassage_jlptLevel_sortOrder_idx" ON "ReadingPassage"("jlptLevel", "sortOrder");

-- ─── ReadingQuestion ──────────────────────────────────────────
CREATE TABLE "ReadingQuestion" (
    "id"          SERIAL       NOT NULL,
    "passageId"   INTEGER      NOT NULL,
    "question"    TEXT         NOT NULL,
    "answer"      TEXT         NOT NULL,
    "explanation" TEXT,
    "sortOrder"   INTEGER      NOT NULL DEFAULT 0,
    CONSTRAINT "ReadingQuestion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ReadingQuestion_passageId_fkey"
        FOREIGN KEY ("passageId") REFERENCES "ReadingPassage"("id") ON DELETE CASCADE
);
CREATE INDEX "ReadingQuestion_passageId_sortOrder_idx" ON "ReadingQuestion"("passageId", "sortOrder");

-- ─── ReadingQuestionOption ────────────────────────────────────
CREATE TABLE "ReadingQuestionOption" (
    "id"         SERIAL   NOT NULL,
    "questionId" INTEGER  NOT NULL,
    "text"       TEXT     NOT NULL,
    "sortOrder"  INTEGER  NOT NULL DEFAULT 0,
    CONSTRAINT "ReadingQuestionOption_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ReadingQuestionOption_questionId_fkey"
        FOREIGN KEY ("questionId") REFERENCES "ReadingQuestion"("id") ON DELETE CASCADE
);
CREATE INDEX "ReadingQuestionOption_questionId_sortOrder_idx" ON "ReadingQuestionOption"("questionId", "sortOrder");

-- ─── ReadingAttempt ───────────────────────────────────────────
CREATE TABLE "ReadingAttempt" (
    "id"          SERIAL           NOT NULL,
    "userId"      INTEGER,
    "passageId"   INTEGER          NOT NULL,
    "correct"     INTEGER          NOT NULL,
    "total"       INTEGER          NOT NULL,
    "percent"     DOUBLE PRECISION NOT NULL,
    "submittedAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadingAttempt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ReadingAttempt_passageId_fkey"
        FOREIGN KEY ("passageId") REFERENCES "ReadingPassage"("id") ON DELETE CASCADE
);
CREATE INDEX "ReadingAttempt_userId_idx" ON "ReadingAttempt"("userId");
CREATE INDEX "ReadingAttempt_passageId_idx" ON "ReadingAttempt"("passageId");

-- ─── DictationAttempt ─────────────────────────────────────────
CREATE TABLE "DictationAttempt" (
    "id"        SERIAL       NOT NULL,
    "userId"    INTEGER,
    "vocabId"   INTEGER      NOT NULL,
    "userInput" TEXT         NOT NULL,
    "correct"   BOOLEAN      NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DictationAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DictationAttempt_userId_idx" ON "DictationAttempt"("userId");
CREATE INDEX "DictationAttempt_vocabId_idx" ON "DictationAttempt"("vocabId");
