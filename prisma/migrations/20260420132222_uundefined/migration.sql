-- DropForeignKey
ALTER TABLE "standup_logs" DROP CONSTRAINT "standup_logs_userId_fkey";

-- AddForeignKey
ALTER TABLE "standup_logs" ADD CONSTRAINT "standup_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
