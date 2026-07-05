-- CreateTable
CREATE TABLE "EnglishKatakanaMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "intro" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishKatakanaMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaTip" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishKatakanaTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaSection" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishKatakanaSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaPoint" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "english" TEXT,
    "katakana" TEXT,
    "romaji" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EnglishKatakanaPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaMapping" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "english" TEXT NOT NULL,
    "katakana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EnglishKatakanaMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaExample" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "english" TEXT NOT NULL,
    "katakana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EnglishKatakanaExample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnglishKatakanaTip_sortOrder_idx" ON "EnglishKatakanaTip"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EnglishKatakanaSection_slug_key" ON "EnglishKatakanaSection"("slug");

-- CreateIndex
CREATE INDEX "EnglishKatakanaSection_sortOrder_idx" ON "EnglishKatakanaSection"("sortOrder");

-- CreateIndex
CREATE INDEX "EnglishKatakanaPoint_sectionId_sortOrder_idx" ON "EnglishKatakanaPoint"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "EnglishKatakanaMapping_sectionId_sortOrder_idx" ON "EnglishKatakanaMapping"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "EnglishKatakanaExample_sectionId_sortOrder_idx" ON "EnglishKatakanaExample"("sectionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "EnglishKatakanaPoint" ADD CONSTRAINT "EnglishKatakanaPoint_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "EnglishKatakanaSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnglishKatakanaMapping" ADD CONSTRAINT "EnglishKatakanaMapping_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "EnglishKatakanaSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnglishKatakanaExample" ADD CONSTRAINT "EnglishKatakanaExample_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "EnglishKatakanaSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
