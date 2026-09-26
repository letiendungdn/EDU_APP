-- CreateTable
CREATE TABLE "TextbookSeries" (
    "id" SERIAL NOT NULL,
    "code" "Textbook" NOT NULL,
    "name" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "planLevels" "JlptLevel"[],
    "audioMatch" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TextbookSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextbookBook" (
    "id" SERIAL NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "level" "JlptLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "url" TEXT,
    "kinds" "MindMapKind"[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TextbookBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TextbookSeries_code_key" ON "TextbookSeries"("code");

-- CreateIndex
CREATE INDEX "TextbookBook_seriesId_level_sortOrder_idx" ON "TextbookBook"("seriesId", "level", "sortOrder");

-- AddForeignKey
ALTER TABLE "TextbookBook" ADD CONSTRAINT "TextbookBook_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "TextbookSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

