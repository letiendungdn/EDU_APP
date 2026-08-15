-- CreateTable
CREATE TABLE "VocabSuffixGroup" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabSuffixGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabSuffixItem" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "suffix" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "attachesTo" TEXT NOT NULL,
    "exampleJa" TEXT NOT NULL,
    "exampleVi" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabSuffixItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VocabSuffixGroup_slug_key" ON "VocabSuffixGroup"("slug");

-- CreateIndex
CREATE INDEX "VocabSuffixGroup_sortOrder_idx" ON "VocabSuffixGroup"("sortOrder");

-- CreateIndex
CREATE INDEX "VocabSuffixItem_groupId_sortOrder_idx" ON "VocabSuffixItem"("groupId", "sortOrder");

-- AddForeignKey
ALTER TABLE "VocabSuffixItem" ADD CONSTRAINT "VocabSuffixItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "VocabSuffixGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
