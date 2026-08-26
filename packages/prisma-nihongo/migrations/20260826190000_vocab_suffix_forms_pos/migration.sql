-- Enrich vocab suffixes for setsubigo (forms / pos / labelJa)
ALTER TABLE "VocabSuffixGroup" ADD COLUMN IF NOT EXISTS "labelJa" TEXT NOT NULL DEFAULT '';
ALTER TABLE "VocabSuffixItem" ADD COLUMN IF NOT EXISTS "forms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "VocabSuffixItem" ADD COLUMN IF NOT EXISTS "pos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
