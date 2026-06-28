-- Quy tắc phát âm tiếng Nhật (reference)

CREATE TABLE "PronunciationRulesMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "intro" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationRulesMeta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PronunciationRuleTip" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationRuleTip_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PronunciationRuleTip_sortOrder_idx" ON "PronunciationRuleTip"("sortOrder");

CREATE TABLE "PronunciationRuleSection" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationRuleSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PronunciationRuleSection_slug_key" ON "PronunciationRuleSection"("slug");
CREATE INDEX "PronunciationRuleSection_sortOrder_idx" ON "PronunciationRuleSection"("sortOrder");

CREATE TABLE "PronunciationRulePoint" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "label" TEXT,
    "japanese" TEXT,
    "romaji" TEXT,
    "explanation" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PronunciationRulePoint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PronunciationRulePoint_sectionId_sortOrder_idx"
  ON "PronunciationRulePoint"("sectionId", "sortOrder");

ALTER TABLE "PronunciationRulePoint"
  ADD CONSTRAINT "PronunciationRulePoint_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "PronunciationRuleSection"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PronunciationRuleExample" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "japanese" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PronunciationRuleExample_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PronunciationRuleExample_sectionId_sortOrder_idx"
  ON "PronunciationRuleExample"("sectionId", "sortOrder");

ALTER TABLE "PronunciationRuleExample"
  ADD CONSTRAINT "PronunciationRuleExample_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "PronunciationRuleSection"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
