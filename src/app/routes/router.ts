import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { workspaceRoutes } from "../module/workspace/workspace.routes";
import { standupLogRoutes } from "../module/standupLogs/standupLogs.routes";
import { inviteRoutes } from "../module/invite/invite.routes";
import { userRoutes } from "../module/user/user.routes";
import { dashboardRoutes } from "../module/dashboard/dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspace",workspaceRoutes);
router.use("/logs",standupLogRoutes);
router.use("/invite",inviteRoutes);
router.use("/users",userRoutes);
router.use("/dashboard", dashboardRoutes);

export const indexRoutes = router;