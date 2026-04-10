-- CreateEnum
CREATE TYPE "BlockerStatus" AS ENUM ('OPEN', 'RESOLVED');

-- AlterTable
ALTER TABLE "standup_logs" ADD COLUMN     "blockerResolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "blockerResolvedBy" TEXT,
ADD COLUMN     "blockerStatus" "BlockerStatus";
