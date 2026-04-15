-- DropForeignKey
ALTER TABLE "standup_logs" DROP CONSTRAINT "standup_logs_workspaceId_fkey";

-- AddForeignKey
ALTER TABLE "standup_logs" ADD CONSTRAINT "standup_logs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
