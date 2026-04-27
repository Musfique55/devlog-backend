import { Router } from "express";
import { adminDashboardRoutes } from "../dashboard/dashboard.admin.routes";
import { adminWorkspaceRoutes } from "../workspace/workspace.admin.routes";
import { adminUserRoutes } from "../users/user.admin.route";


const router = Router();

// aggregated admin routes
router.use("/dashboard",adminDashboardRoutes);
router.use("/workspaces",adminWorkspaceRoutes);
router.use("/users",adminUserRoutes);


export const adminRoutes = router;