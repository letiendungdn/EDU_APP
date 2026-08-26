-- CreateTable
CREATE TABLE "HomeStat" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "suffix" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeFeatureSection" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeFeatureSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeFeatureItem" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeFeatureItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeStat_sortOrder_idx" ON "HomeStat"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "HomeFeatureSection_slug_key" ON "HomeFeatureSection"("slug");

-- CreateIndex
CREATE INDEX "HomeFeatureSection_sortOrder_idx" ON "HomeFeatureSection"("sortOrder");

-- CreateIndex
CREATE INDEX "HomeFeatureItem_sectionId_sortOrder_idx" ON "HomeFeatureItem"("sectionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "HomeFeatureItem" ADD CONSTRAINT "HomeFeatureItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomeFeatureSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
