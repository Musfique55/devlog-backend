-- DropForeignKey
ALTER TABLE "workspace" DROP CONSTRAINT "workspace_adminId_fkey";

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
