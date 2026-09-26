-- AlterTable
ALTER TABLE "JlptRoadmapLevel" ADD COLUMN "grammarTarget" TEXT NOT NULL DEFAULT '';

UPDATE "JlptRoadmapLevel" SET "vocabTarget" = '~800 từ' WHERE "externalKey" = 'n5';
UPDATE "JlptRoadmapLevel" SET "vocabTarget" = '~1.500 từ (gồm N5)' WHERE "externalKey" = 'n4';
UPDATE "JlptRoadmapLevel" SET "vocabTarget" = '~3.750 từ (gồm N5–N4)' WHERE "externalKey" = 'n3';

UPDATE "JlptRoadmapLevel" SET "kanjiTarget" = '~100 chữ' WHERE "externalKey" = 'n5';
UPDATE "JlptRoadmapLevel" SET "kanjiTarget" = '~300 chữ (gồm N5)' WHERE "externalKey" = 'n4';
UPDATE "JlptRoadmapLevel" SET "kanjiTarget" = '~650 chữ (gồm N5–N4)' WHERE "externalKey" = 'n3';

UPDATE "JlptRoadmapLevel" SET "grammarTarget" = '~80 mẫu' WHERE "externalKey" = 'n5';
UPDATE "JlptRoadmapLevel" SET "grammarTarget" = '~170 mẫu (gồm N5)' WHERE "externalKey" = 'n4';
UPDATE "JlptRoadmapLevel" SET "grammarTarget" = '~350 mẫu (gồm N5–N4)' WHERE "externalKey" = 'n3';
