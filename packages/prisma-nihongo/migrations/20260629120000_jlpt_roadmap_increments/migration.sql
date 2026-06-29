-- AlterTable
ALTER TABLE "JlptRoadmapLevel" ADD COLUMN "vocabIncrement" TEXT NOT NULL DEFAULT '';
ALTER TABLE "JlptRoadmapLevel" ADD COLUMN "kanjiIncrement" TEXT NOT NULL DEFAULT '';
ALTER TABLE "JlptRoadmapLevel" ADD COLUMN "grammarIncrement" TEXT NOT NULL DEFAULT '';

UPDATE "JlptRoadmapLevel" SET "vocabIncrement" = '', "kanjiIncrement" = '', "grammarIncrement" = '' WHERE "externalKey" = 'n5';
UPDATE "JlptRoadmapLevel" SET "vocabIncrement" = '+700 từ mới', "kanjiIncrement" = '+200 chữ mới', "grammarIncrement" = '+90 mẫu mới' WHERE "externalKey" = 'n4';
UPDATE "JlptRoadmapLevel" SET "vocabIncrement" = '+2.250 từ mới', "kanjiIncrement" = '+350 chữ mới', "grammarIncrement" = '+180 mẫu mới' WHERE "externalKey" = 'n3';
