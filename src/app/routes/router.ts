import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { workspaceRoutes } from "../module/workspace/workspace.routes";
import { standupLogRoutes } from "../module/standupLogs/standupLogs.routes";
import { inviteRoutes } from "../module/invite/invite.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspace",workspaceRoutes);
router.use("/logs",standupLogRoutes);
router.use("/invite",inviteRoutes);



export const indexRoutes = router;