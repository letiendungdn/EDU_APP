-- =============================================================
-- Migration: v2_redesign
-- Changes:
--   + Enums: JlptLevel, ExerciseType, ContentType
--   + Lesson: jlptLevel, description, thumbnailUrl
--   + Vocabulary: jlptLevel, partOfSpeech, pitchAccent, audioUrl, frequencyRank, meaningEn + indexes
--   + Grammar: jlptLevel, formalityLevel + indexes
--   + Example: audioUrl
--   + Exercise: type TEXT→enum, options TEXT→JSONB, difficulty, explanation, audioUrl
--   + KanjiLesson: jlptLevel TEXT→enum
--   + KanjiEntry: jlptLevel, strokeCount, frequency, grade, meaningEn
--   + User: avatarUrl, nativeLanguage, targetJlptLevel, studyGoalMinutes, lastActiveAt, totalStudySeconds
--   + SrsCard (new — replaces ReviewLog, SM-2 spaced repetition)
--   + ExamSectionResult (new — normalizes ExamResult.sectionScores JSON)
--   + StudySession (new — daily study tracking)
--   ~ ExamResult.percent INT→FLOAT, sectionScores removed
--   ~ ListeningLog.date TEXT→DATE, + lessonFrom, lessonTo
--   - ReviewLog (dropped, data migrated to SrsCard)
-- =============================================================

-- ─── 1. New Enums ────────────────────────────────────────────

CREATE TYPE "JlptLevel" AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1');
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_IN_BLANK', 'LISTENING');
CREATE TYPE "ContentType" AS ENUM ('VOCABULARY', 'GRAMMAR', 'KANJI');

-- ─── 2. Lesson ───────────────────────────────────────────────

ALTER TABLE "Lesson" ADD COLUMN "description" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "jlptLevel" "JlptLevel";
ALTER TABLE "Lesson" ADD COLUMN "thumbnailUrl" TEXT;

CREATE INDEX "Lesson_jlptLevel_idx" ON "Lesson"("jlptLevel");

-- ─── 3. Vocabulary ───────────────────────────────────────────

ALTER TABLE "Vocabulary" ADD COLUMN "meaningEn" TEXT;
ALTER TABLE "Vocabulary" ADD COLUMN "partOfSpeech" TEXT;
ALTER TABLE "Vocabulary" ADD COLUMN "jlptLevel" "JlptLevel";
ALTER TABLE "Vocabulary" ADD COLUMN "pitchAccent" TEXT;
ALTER TABLE "Vocabulary" ADD COLUMN "audioUrl" TEXT;
ALTER TABLE "Vocabulary" ADD COLUMN "frequencyRank" INTEGER;

CREATE INDEX "Vocabulary_lessonId_idx" ON "Vocabulary"("lessonId");
CREATE INDEX "Vocabulary_jlptLevel_idx" ON "Vocabulary"("jlptLevel");

-- ─── 4. Grammar ──────────────────────────────────────────────

ALTER TABLE "Grammar" ADD COLUMN "jlptLevel" "JlptLevel";
ALTER TABLE "Grammar" ADD COLUMN "formalityLevel" TEXT;

CREATE INDEX "Grammar_lessonId_idx" ON "Grammar"("lessonId");
CREATE INDEX "Grammar_jlptLevel_idx" ON "Grammar"("jlptLevel");

-- ─── 5. Example ──────────────────────────────────────────────

ALTER TABLE "Example" ADD COLUMN "audioUrl" TEXT;

-- ─── 6. Exercise ─────────────────────────────────────────────

-- type: TEXT → ExerciseType enum
ALTER TABLE "Exercise" ADD COLUMN "type_new" "ExerciseType";
UPDATE "Exercise" SET "type_new" =
  CASE "type"
    WHEN 'multiple_choice' THEN 'MULTIPLE_CHOICE'::"ExerciseType"
    WHEN 'fill_in_blank'   THEN 'FILL_IN_BLANK'::"ExerciseType"
    WHEN 'listening'       THEN 'LISTENING'::"ExerciseType"
    ELSE 'MULTIPLE_CHOICE'::"ExerciseType"
  END;
ALTER TABLE "Exercise" DROP COLUMN "type";
ALTER TABLE "Exercise" RENAME COLUMN "type_new" TO "type";
ALTER TABLE "Exercise" ALTER COLUMN "type" SET NOT NULL;

-- options: TEXT → JSONB
ALTER TABLE "Exercise"
  ALTER COLUMN "options" TYPE JSONB
  USING CASE
    WHEN "options" IS NULL OR TRIM("options") = '' THEN NULL
    ELSE "options"::jsonb
  END;

ALTER TABLE "Exercise" ADD COLUMN "explanation" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "audioUrl" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "difficulty" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "Exercise_lessonId_idx" ON "Exercise"("lessonId");

-- ─── 7. KanjiLesson ──────────────────────────────────────────

-- jlptLevel: TEXT → JlptLevel enum
ALTER TABLE "KanjiLesson" ADD COLUMN "jlptLevel_new" "JlptLevel";
UPDATE "KanjiLesson" SET "jlptLevel_new" =
  CASE "jlptLevel"
    WHEN 'N5' THEN 'N5'::"JlptLevel"
    WHEN 'N4' THEN 'N4'::"JlptLevel"
    WHEN 'N3' THEN 'N3'::"JlptLevel"
    WHEN 'N2' THEN 'N2'::"JlptLevel"
    WHEN 'N1' THEN 'N1'::"JlptLevel"
    ELSE NULL
  END;
ALTER TABLE "KanjiLesson" DROP COLUMN "jlptLevel";
ALTER TABLE "KanjiLesson" RENAME COLUMN "jlptLevel_new" TO "jlptLevel";

CREATE INDEX "KanjiLesson_jlptLevel_idx" ON "KanjiLesson"("jlptLevel");

-- ─── 8. KanjiEntry ───────────────────────────────────────────

ALTER TABLE "KanjiEntry" ADD COLUMN "meaningEn" TEXT;
ALTER TABLE "KanjiEntry" ADD COLUMN "jlptLevel" "JlptLevel";
ALTER TABLE "KanjiEntry" ADD COLUMN "strokeCount" INTEGER;
ALTER TABLE "KanjiEntry" ADD COLUMN "frequency" INTEGER;
ALTER TABLE "KanjiEntry" ADD COLUMN "grade" INTEGER;

CREATE INDEX "KanjiEntry_jlptLevel_idx" ON "KanjiEntry"("jlptLevel");

-- ─── 9. User ─────────────────────────────────────────────────

ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "nativeLanguage" TEXT DEFAULT 'vi';
ALTER TABLE "User" ADD COLUMN "targetJlptLevel" "JlptLevel";
ALTER TABLE "User" ADD COLUMN "studyGoalMinutes" INTEGER DEFAULT 30;
ALTER TABLE "User" ADD COLUMN "lastActiveAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "totalStudySeconds" INTEGER NOT NULL DEFAULT 0;

-- ─── 10. SrsCard (replaces ReviewLog) ────────────────────────

CREATE TABLE "SrsCard" (
    "id"             SERIAL          NOT NULL,
    "userId"         INTEGER         NOT NULL,
    "contentType"    "ContentType"   NOT NULL,
    "contentId"      INTEGER         NOT NULL,
    "kana"           TEXT            NOT NULL,
    "kanji"          TEXT,
    "meaning"        TEXT            NOT NULL,
    "lessonNumber"   INTEGER         NOT NULL,
    "easeFactor"     DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval"       INTEGER         NOT NULL DEFAULT 0,
    "repetitions"    INTEGER         NOT NULL DEFAULT 0,
    "nextReviewAt"   TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "wrongCount"     INTEGER         NOT NULL DEFAULT 0,
    "correctCount"   INTEGER         NOT NULL DEFAULT 0,
    "reviewStreak"   INTEGER         NOT NULL DEFAULT 0,
    "mastered"       BOOLEAN         NOT NULL DEFAULT false,
    "createdAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SrsCard_pkey" PRIMARY KEY ("id")
);

-- Migrate ReviewLog → SrsCard
-- contentId: khớp với Vocabulary.id qua kana+lessonNumber, fallback về ReviewLog.id
INSERT INTO "SrsCard" (
    "userId", "contentType", "contentId",
    "kana", "kanji", "meaning", "lessonNumber",
    "wrongCount", "reviewStreak", "mastered",
    "lastReviewedAt", "createdAt", "updatedAt"
)
SELECT
    rl."userId",
    'VOCABULARY'::"ContentType",
    COALESCE(
        (SELECT v.id FROM "Vocabulary" v
         INNER JOIN "Lesson" l ON v."lessonId" = l.id
         WHERE v.kana = rl.kana AND l."lessonNumber" = rl."lessonNumber"
         ORDER BY v.id LIMIT 1),
        rl.id
    ),
    rl.kana, rl.kanji, rl.meaning, rl."lessonNumber",
    rl."wrongCount", rl."reviewStreak", rl.mastered,
    rl."lastReviewedAt", rl."createdAt", rl."updatedAt"
FROM "ReviewLog" rl
ON CONFLICT DO NOTHING;

ALTER TABLE "SrsCard"
    ADD CONSTRAINT "SrsCard_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "SrsCard_userId_contentType_contentId_key"
    ON "SrsCard"("userId", "contentType", "contentId");
CREATE INDEX "SrsCard_userId_mastered_idx"    ON "SrsCard"("userId", "mastered");
CREATE INDEX "SrsCard_userId_nextReviewAt_idx" ON "SrsCard"("userId", "nextReviewAt");
CREATE INDEX "SrsCard_userId_contentType_idx"  ON "SrsCard"("userId", "contentType");

DROP TABLE "ReviewLog";

-- ─── 11. ExamResult + ExamSectionResult ──────────────────────

-- percent: INTEGER → FLOAT
ALTER TABLE "ExamResult"
    ALTER COLUMN "percent" TYPE DOUBLE PRECISION USING "percent"::double precision;

-- Fix FK to cascade SET NULL
ALTER TABLE "ExamResult" DROP CONSTRAINT IF EXISTS "ExamResult_userId_fkey";
ALTER TABLE "ExamResult"
    ADD CONSTRAINT "ExamResult_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ExamSectionResult table
CREATE TABLE "ExamSectionResult" (
    "id"           SERIAL           NOT NULL,
    "examResultId" INTEGER          NOT NULL,
    "section"      TEXT             NOT NULL,
    "correct"      INTEGER          NOT NULL,
    "total"        INTEGER          NOT NULL,
    "percent"      DOUBLE PRECISION NOT NULL,
    CONSTRAINT "ExamSectionResult_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ExamSectionResult_examResultId_fkey"
        FOREIGN KEY ("examResultId") REFERENCES "ExamResult"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ExamSectionResult_examResultId_idx" ON "ExamSectionResult"("examResultId");

-- Migrate sectionScores JSON (array format) → ExamSectionResult rows
-- Format: [{"sectionId":"vocab","correct":3,"total":12}, ...]
INSERT INTO "ExamSectionResult" ("examResultId", "section", "correct", "total", "percent")
SELECT
    er.id,
    elem->>'sectionId',
    (elem->>'correct')::int,
    (elem->>'total')::int,
    CASE WHEN (elem->>'total')::int > 0
        THEN ROUND(((elem->>'correct')::float / (elem->>'total')::int * 100)::numeric, 2)
        ELSE 0
    END
FROM "ExamResult" er,
LATERAL jsonb_array_elements(er."sectionScores") AS elem
WHERE er."sectionScores" IS NOT NULL
  AND jsonb_typeof(er."sectionScores") = 'array';

ALTER TABLE "ExamResult" DROP COLUMN "sectionScores";

-- ─── 12. ListeningLog ────────────────────────────────────────

-- date: TEXT → DATE
ALTER TABLE "ListeningLog" ADD COLUMN "date_new" DATE;
UPDATE "ListeningLog" SET "date_new" = "date"::date;
ALTER TABLE "ListeningLog" DROP CONSTRAINT "ListeningLog_userId_date_key";
ALTER TABLE "ListeningLog" DROP COLUMN "date";
ALTER TABLE "ListeningLog" RENAME COLUMN "date_new" TO "date";
ALTER TABLE "ListeningLog" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "ListeningLog"
    ADD CONSTRAINT "ListeningLog_userId_date_key" UNIQUE ("userId", "date");

ALTER TABLE "ListeningLog" ADD COLUMN "lessonFrom" INTEGER;
ALTER TABLE "ListeningLog" ADD COLUMN "lessonTo" INTEGER;

-- Fix cascade
ALTER TABLE "ListeningLog" DROP CONSTRAINT IF EXISTS "ListeningLog_userId_fkey";
ALTER TABLE "ListeningLog"
    ADD CONSTRAINT "ListeningLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 13. StudySession ────────────────────────────────────────

CREATE TABLE "StudySession" (
    "id"            SERIAL       NOT NULL,
    "userId"        INTEGER      NOT NULL,
    "date"          DATE         NOT NULL,
    "seconds"       INTEGER      NOT NULL DEFAULT 0,
    "cardsReviewed" INTEGER      NOT NULL DEFAULT 0,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StudySession_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "StudySession_userId_date_key" ON "StudySession"("userId", "date");
CREATE INDEX "StudySession_userId_idx" ON "StudySession"("userId");
