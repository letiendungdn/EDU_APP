-- Conversation / 自己紹介 & daily phrases
CREATE TABLE "ConversationIntroLine" (
    "id" SERIAL NOT NULL,
    "ja" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "tip" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationIntroLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationIntroSlot" (
    "id" SERIAL NOT NULL,
    "slot" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationIntroSlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationIntroExample" (
    "id" SERIAL NOT NULL,
    "slotId" INTEGER NOT NULL,
    "ja" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationIntroExample_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationPhraseGroup" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationPhraseGroup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationPhraseItem" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "ja" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationPhraseItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConversationIntroLine_sortOrder_idx" ON "ConversationIntroLine"("sortOrder");
CREATE INDEX "ConversationIntroSlot_sortOrder_idx" ON "ConversationIntroSlot"("sortOrder");
CREATE INDEX "ConversationIntroExample_slotId_sortOrder_idx" ON "ConversationIntroExample"("slotId", "sortOrder");
CREATE UNIQUE INDEX "ConversationPhraseGroup_slug_key" ON "ConversationPhraseGroup"("slug");
CREATE INDEX "ConversationPhraseGroup_sortOrder_idx" ON "ConversationPhraseGroup"("sortOrder");
CREATE INDEX "ConversationPhraseItem_groupId_sortOrder_idx" ON "ConversationPhraseItem"("groupId", "sortOrder");

ALTER TABLE "ConversationIntroExample" ADD CONSTRAINT "ConversationIntroExample_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ConversationIntroSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationPhraseItem" ADD CONSTRAINT "ConversationPhraseItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ConversationPhraseGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
