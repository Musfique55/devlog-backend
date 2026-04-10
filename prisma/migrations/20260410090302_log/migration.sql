-- AlterTable
ALTER TABLE "standup_logs" ALTER COLUMN "blockerResolvedAt" DROP NOT NULL,
ALTER COLUMN "blockerResolvedAt" DROP DEFAULT;
