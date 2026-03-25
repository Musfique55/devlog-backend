import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE, TEAM_ROLE } from "../../../generated/prisma/enums";
import { StandupLogController } from "./standupLogs.controller";
import { teamAuth } from "../../middleware/TeamAuth";

const router = Router();

router.post("/",checkAuth(APP_ROLE.SUPER_ADMIN,APP_ROLE.USER),StandupLogController.createLog);
router.patch("/:id",checkAuth(APP_ROLE.USER),StandupLogController.updateLog);
router.delete("/:id",checkAuth(APP_ROLE.USER),StandupLogController.deleteLog);
router.get("/:id",checkAuth(APP_ROLE.USER),StandupLogController.getLogById);
router.get("/",StandupLogController.getLogs);
router.get("/workspace/:workspaceId",checkAuth(APP_ROLE.USER),teamAuth(TEAM_ROLE.ADMIN),StandupLogController.getLogsByWorkspaceId);
router.get("/blocker/:blocker",checkAuth(APP_ROLE.USER),teamAuth(TEAM_ROLE.ADMIN),StandupLogController.getAllBlockerLogs);

export const standupLogRoutes = router;
