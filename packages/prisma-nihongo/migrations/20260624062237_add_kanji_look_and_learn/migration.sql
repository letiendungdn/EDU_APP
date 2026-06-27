-- CreateTable
CREATE TABLE "KanjiLesson" (
    "id" SERIAL NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "title" TEXT,
    "jlptLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanjiLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiEntry" (
    "id" SERIAL NOT NULL,
    "character" TEXT NOT NULL,
    "hanViet" TEXT,
    "onyomi" TEXT,
    "kunyomi" TEXT,
    "meaningVi" TEXT NOT NULL,
    "mnemonicJp" TEXT,
    "mnemonicVi" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanjiEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiVocab" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "kanjiEntryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanjiVocab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KanjiLesson_lessonNumber_key" ON "KanjiLesson"("lessonNumber");

-- CreateIndex
CREATE INDEX "KanjiLesson_lessonNumber_idx" ON "KanjiLesson"("lessonNumber");

-- CreateIndex
CREATE INDEX "KanjiEntry_lessonId_idx" ON "KanjiEntry"("lessonId");

-- CreateIndex
CREATE INDEX "KanjiEntry_character_idx" ON "KanjiEntry"("character");

-- CreateIndex
CREATE INDEX "KanjiVocab_kanjiEntryId_idx" ON "KanjiVocab"("kanjiEntryId");

-- AddForeignKey
ALTER TABLE "KanjiEntry" ADD CONSTRAINT "KanjiEntry_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "KanjiLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiVocab" ADD CONSTRAINT "KanjiVocab_kanjiEntryId_fkey" FOREIGN KEY ("kanjiEntryId") REFERENCES "KanjiEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
