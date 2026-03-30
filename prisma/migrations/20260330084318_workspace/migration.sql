/*
  Warnings:

  - You are about to alter the column `name` on the `workspace` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE "workspace" ALTER COLUMN "name" SET DATA TYPE VARCHAR(20);
