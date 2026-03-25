import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { workspaceRoutes } from "../module/workspace/workspace.routes";
import { standupLogRoutes } from "../module/standupLogs/standupLogs.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspace",workspaceRoutes);
router.use("/logs",standupLogRoutes)



export const indexRoutes = router;