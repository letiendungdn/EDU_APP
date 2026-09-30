-- CreateTable
CREATE TABLE "ProcessedEvent" (
    "eventId" TEXT NOT NULL,
    "consumer" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedEvent_pkey" PRIMARY KEY ("eventId","consumer")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "key" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "roles" "Role"[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);


-- Flag mặc định: giữ nguyên hành vi hiện tại (ô tra từ đang bật). Không phụ thuộc dữ liệu khác → an toàn cả trên DB mới.
INSERT INTO "FeatureFlag" ("key", "description", "enabled", "roles", "updatedAt")
VALUES ('vocab-search-all-lessons', 'Ô "Tra từ trên mọi bài" ở trang Từ vựng', true, '{}', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
