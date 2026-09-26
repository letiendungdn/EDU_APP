-- AlterTable
ALTER TABLE "BookAudioItem" ADD COLUMN "driveId" TEXT,
ADD COLUMN "driveKind" TEXT,
ADD COLUMN "folderId" INTEGER;

-- CreateTable
CREATE TABLE "BookAudioDriveFolder" (
    "id" SERIAL NOT NULL,
    "driveId" TEXT NOT NULL,
    "title" TEXT,
    "localPath" TEXT,
    "fileCount" INTEGER NOT NULL DEFAULT 0,
    "downloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAudioDriveFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAudioFile" (
    "id" SERIAL NOT NULL,
    "folderId" INTEGER,
    "itemId" INTEGER,
    "driveFileId" TEXT,
    "fileName" TEXT NOT NULL,
    "localPath" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAudioFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookAudioDriveFolder_driveId_key" ON "BookAudioDriveFolder"("driveId");

-- CreateIndex
CREATE INDEX "BookAudioItem_folderId_idx" ON "BookAudioItem"("folderId");

-- CreateIndex
CREATE INDEX "BookAudioItem_driveId_idx" ON "BookAudioItem"("driveId");

-- CreateIndex
CREATE INDEX "BookAudioFile_folderId_sortOrder_idx" ON "BookAudioFile"("folderId", "sortOrder");

-- CreateIndex
CREATE INDEX "BookAudioFile_itemId_sortOrder_idx" ON "BookAudioFile"("itemId", "sortOrder");

-- AddForeignKey
ALTER TABLE "BookAudioItem" ADD CONSTRAINT "BookAudioItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "BookAudioDriveFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAudioFile" ADD CONSTRAINT "BookAudioFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "BookAudioDriveFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAudioFile" ADD CONSTRAINT "BookAudioFile_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "BookAudioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
