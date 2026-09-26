-- CreateTable
CREATE TABLE "BookAudioMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "sourceUrl" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAudioMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAudioItem" (
    "id" SERIAL NOT NULL,
    "externalKey" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "note" TEXT,
    "listNo" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAudioItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookAudioItem_externalKey_key" ON "BookAudioItem"("externalKey");

-- CreateIndex
CREATE INDEX "BookAudioItem_level_sortOrder_idx" ON "BookAudioItem"("level", "sortOrder");
