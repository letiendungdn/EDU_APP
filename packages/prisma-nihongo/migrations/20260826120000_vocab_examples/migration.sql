-- Vocabulary example sentences (from vocab-pattern-example / Minna sentence builder)
ALTER TABLE "Vocabulary" ADD COLUMN IF NOT EXISTS "exampleJa" TEXT;
ALTER TABLE "Vocabulary" ADD COLUMN IF NOT EXISTS "exampleKana" TEXT;
ALTER TABLE "Vocabulary" ADD COLUMN IF NOT EXISTS "exampleVi" TEXT;
