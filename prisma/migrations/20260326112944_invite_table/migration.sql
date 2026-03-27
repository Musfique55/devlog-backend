/*
  Warnings:

  - The values [REJECTED] on the enum `InviteStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[token]` on the table `invite` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InviteStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');
ALTER TABLE "public"."invite" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "invite" ALTER COLUMN "status" TYPE "InviteStatus_new" USING ("status"::text::"InviteStatus_new");
ALTER TYPE "InviteStatus" RENAME TO "InviteStatus_old";
ALTER TYPE "InviteStatus_new" RENAME TO "InviteStatus";
DROP TYPE "public"."InviteStatus_old";
ALTER TABLE "invite" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "invite_token_idx";

-- CreateIndex
CREATE UNIQUE INDEX "invite_token_key" ON "invite"("token");
