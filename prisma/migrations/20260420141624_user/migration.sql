-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_workspaceId_fkey";

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
