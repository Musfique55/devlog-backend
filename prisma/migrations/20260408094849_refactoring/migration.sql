/*
  Warnings:

  - You are about to drop the column `projectTag` on the `standup_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "standup_logs" DROP COLUMN "projectTag",
ADD COLUMN     "projectTags" TEXT[];
