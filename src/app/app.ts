import express, { Request,Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import { indexRoutes } from "./routes/router";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import cron from "node-cron";
import { inviteServices } from "./module/invite/invite.services";
import path from "path";
import { StandupLogServices } from "./module/standupLogs/standupLogs.services";
import { prisma } from "../lib/prisma";
import { sendEmail } from "./utils/sendEmail";
import { getWeekRange } from "./utils/getWeekRange";
import { PLAN } from "../generated/prisma/client/enums";
import { paymentController } from "./module/payment/payment.controller";
import { envVars } from "./config/env";
import { paymentServices } from "./module/payment/payment.services";

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/templates"));

app.use(cors({
  origin : [envVars.FRONTEND_URL || "http://localhost:3000"],
  credentials : true,
  methods : ["GET","POST","PUT","PATCH","DELETE"],
  allowedHeaders : ["Content-Type","Authorization"],
}));

app.use("/api/auth", toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



cron.schedule("0 0 * * *", async () => {
  await inviteServices.updateExpiredTokens();
});

cron.schedule("0 9 * * 5", async () => {
  const workspaces = await prisma.workspace.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      admin: {
        isBlocked: false,
        plan: PLAN.PRO,
      },
    },
    include: {
      admin: true,
      members: {
        include: {
          user: true,
        },
      },
      logs: true,
    },
  });

  for (const workspace of workspaces) {
    await sendEmail({
      to: workspace.admin.email,
      subject: `Weekly Standup Report for ${workspace.name}`,
      templateName: "weekly-report",
      templateData: {
        workspaceName: workspace.name,
        members: workspace.members
          .filter((member) => member.userId !== workspace.adminId)
          .map((member) => ({
            name: member.user.name,
            logCount: workspace.logs.filter(
              (log) => log.userId === member.userId,
            ).length,
          })),
        totalMembers: workspace.members.length,
        weekRange: getWeekRange(),
        totalLogs: await StandupLogServices.standupLogCount(workspace.adminId),
        totalBlockers: workspace.logs.filter((log) => log.blocker).length,
        blockers: workspace.logs
          .filter((log) => log.blocker)
          .map((log) => ({
            memberName: workspace.members.find(
              (member) => member.userId === log.userId,
            )?.user.name,
            date: log.createdAt.toDateString(),
            text: log.blocker,
          })),
        workspaceUrl: `${process.env.FRONTEND_URL}/workspace/${workspace.id}`,
      },
    });
  }
});

cron.schedule("59 23 * * *",async () => {
  await paymentServices.expiredSubscription();
})

app.get("/", async(req, res) => {
  res.status(200).json({
    message : "server is running",
    success : true
  })
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

app.use("/api/v1", indexRoutes);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
