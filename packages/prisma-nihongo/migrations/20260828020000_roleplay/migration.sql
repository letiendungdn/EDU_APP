-- Roleplay / đóng vai hội thoại
CREATE TABLE "RoleplayScene" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleJa" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleplayScene_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoleplayLine" (
    "id" SERIAL NOT NULL,
    "sceneId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "ja" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleplayLine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoleplayScene_slug_key" ON "RoleplayScene"("slug");
CREATE INDEX "RoleplayScene_sortOrder_idx" ON "RoleplayScene"("sortOrder");
CREATE INDEX "RoleplayLine_sceneId_sortOrder_idx" ON "RoleplayLine"("sceneId", "sortOrder");

ALTER TABLE "RoleplayLine" ADD CONSTRAINT "RoleplayLine_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "RoleplayScene"("id") ON DELETE CASCADE ON UPDATE CASCADE;
