-- Bổ sung mục tiêu JLPT N2/N1 cho lộ trình (dữ liệu chi tiết qua seed-jlpt-roadmap-n2-n1.ts)

UPDATE "JlptRoadmapLevel" SET
  "vocabTarget" = '~6.000 từ (gồm N5–N3)',
  "kanjiTarget" = '~1.000 chữ (gồm N5–N3)',
  "grammarTarget" = '~500 mẫu (gồm N5–N3)',
  "vocabIncrement" = '+2.250 từ mới',
  "kanjiIncrement" = '+350 chữ mới',
  "grammarIncrement" = '+150 mẫu mới'
WHERE "externalKey" = 'n2';

UPDATE "JlptRoadmapLevel" SET
  "vocabTarget" = '~9.700 từ (gồm N5–N2)',
  "kanjiTarget" = '~2.136 chữ (gồm N5–N2)',
  "grammarTarget" = '~650 mẫu (gồm N5–N2)',
  "vocabIncrement" = '+3.700 từ mới',
  "kanjiIncrement" = '+1.136 chữ mới',
  "grammarIncrement" = '+150 mẫu mới'
WHERE "externalKey" = 'n1';
