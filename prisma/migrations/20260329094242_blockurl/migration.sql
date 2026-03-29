/*
  Warnings:

  - The `blockerUrl` column on the `standup_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "standup_logs" DROP COLUMN "blockerUrl",
ADD COLUMN     "blockerUrl" TEXT[];
