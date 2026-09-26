-- JLPT mind maps (grammar / vocab / kanji)
-- Idempotent: một số DB dev đã tạo bảng này bằng tay (manual_mind_maps.sql trước đây).

DO $$ BEGIN
  CREATE TYPE "MindMapKind" AS ENUM ('GRAMMAR', 'VOCAB', 'KANJI');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "MindMapLevel" (
  "id" SERIAL NOT NULL,
  "kind" "MindMapKind" NOT NULL,
  "level" "JlptLevel" NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "accent" TEXT NOT NULL DEFAULT '#3b82f6',
  "branches" JSONB NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MindMapLevel_pkey" PRIMARY KEY ("id")
);

-- Bảng tạo tay trước đây có DEFAULT cho updatedAt; Prisma tự set giá trị này.
ALTER TABLE "MindMapLevel" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE UNIQUE INDEX IF NOT EXISTS "MindMapLevel_kind_level_key" ON "MindMapLevel"("kind", "level");
CREATE INDEX IF NOT EXISTS "MindMapLevel_kind_sortOrder_idx" ON "MindMapLevel"("kind", "sortOrder");
