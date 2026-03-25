import { Router } from "express";
import { authRoutes } from "../module/auth/auth.routes";
import { workspaceRoutes } from "../module/workspace/workspace.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspace",workspaceRoutes);



export const indexRoutes = router;