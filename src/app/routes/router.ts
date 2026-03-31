import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { workspaceRoutes } from "../module/workspace/workspace.routes";
import { standupLogRoutes } from "../module/standupLogs/standupLogs.routes";
import { inviteRoutes } from "../module/invite/invite.routes";
import { userRoutes } from "../module/user/user.routes";
import { dashboardRoutes } from "../module/dashboard/dashboard.routes";
import { checkoutRoutes } from "../module/checkout/checkout.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspace",workspaceRoutes);
router.use("/logs",standupLogRoutes);
router.use("/invite",inviteRoutes);
router.use("/users",userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/payment",checkoutRoutes);

export const indexRoutes = router;