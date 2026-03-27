/*
  Warnings:

  - You are about to drop the `StandupLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "StandupLog";

-- CreateTable
CREATE TABLE "standup_logs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "userId" TEXT NOT NULL,
    "todayWork" TEXT NOT NULL,
    "tomorrowWork" TEXT NOT NULL,
    "blocker" TEXT,
    "blockerUrl" TEXT,
    "projectTag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "standup_logs_userId_key" ON "standup_logs"("userId");
