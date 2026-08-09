-- CreateTable
CREATE TABLE "CountryRegion" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryNameItem" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "nameJa" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CountryNameItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryRegion_slug_key" ON "CountryRegion"("slug");

-- CreateIndex
CREATE INDEX "CountryRegion_sortOrder_idx" ON "CountryRegion"("sortOrder");

-- CreateIndex
CREATE INDEX "CountryNameItem_regionId_sortOrder_idx" ON "CountryNameItem"("regionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "CountryNameItem" ADD CONSTRAINT "CountryNameItem_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "CountryRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
