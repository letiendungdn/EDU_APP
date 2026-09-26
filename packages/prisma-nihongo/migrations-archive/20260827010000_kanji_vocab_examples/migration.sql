-- KanjiVocab example sentences (related-vocab sidepanel)
ALTER TABLE "KanjiVocab" ADD COLUMN IF NOT EXISTS "exampleJa" TEXT;
ALTER TABLE "KanjiVocab" ADD COLUMN IF NOT EXISTS "exampleKana" TEXT;
ALTER TABLE "KanjiVocab" ADD COLUMN IF NOT EXISTS "exampleVi" TEXT;

-- Prefer Vocabulary.example* when the same written form exists
UPDATE "KanjiVocab" kv
SET
  "exampleJa" = v."exampleJa",
  "exampleKana" = v."exampleKana",
  "exampleVi" = v."exampleVi"
FROM (
  SELECT DISTINCT ON (kanji)
    kanji AS word,
    "exampleJa",
    "exampleKana",
    "exampleVi"
  FROM "Vocabulary"
  WHERE kanji IS NOT NULL
    AND kanji <> ''
    AND "exampleJa" IS NOT NULL
    AND "exampleJa" <> ''
  ORDER BY kanji, id
) v
WHERE kv.word = v.word
  AND (kv."exampleJa" IS NULL OR kv."exampleJa" = '');
