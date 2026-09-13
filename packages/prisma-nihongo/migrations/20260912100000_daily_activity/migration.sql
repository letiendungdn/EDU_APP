-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userId_date_kind_key" ON "DailyActivity"("userId", "date", "kind");

-- CreateIndex
CREATE INDEX "DailyActivity_userId_date_idx" ON "DailyActivity"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
