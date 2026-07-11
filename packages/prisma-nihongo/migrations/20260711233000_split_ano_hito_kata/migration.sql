-- Split combined あの人（あの方） into two vocabulary entries (lesson 1).

UPDATE "Vocabulary"
SET "sortOrder" = "sortOrder" + 1
WHERE "lessonId" = 1 AND "sortOrder" >= 4;

UPDATE "Vocabulary"
SET
  kanji = 'あの 人',
  kana = 'あの ひと',
  romaji = 'ano hito',
  meaning = 'người kia',
  "updatedAt" = NOW()
WHERE id = 26970;

INSERT INTO "Vocabulary" (
  kanji,
  kana,
  romaji,
  meaning,
  "lessonId",
  "sortOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  'あの 方',
  'あの かた',
  'ano kata',
  'người kia (kính ngữ)',
  1,
  4,
  NOW(),
  NOW()
);
