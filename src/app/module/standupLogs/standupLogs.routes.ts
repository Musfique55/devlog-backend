import {  Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE, TEAM_ROLE } from "../../../generated/prisma/enums";
import { StandupLogController } from "./standupLogs.controller";
import { teamAuth } from "../../middleware/TeamAuth";
import { multerStorage } from "../../config/multer.config";
import { standupLogBlockerImageUploadMiddleware } from "./standup.middleware";
import zodRequestValidation from "../../helper/zodRequestValidation";
import {  logValidator } from "./standupLogs.validator";

const router = Router();

router.post(
  "/",
  checkAuth(APP_ROLE.USER),
  multerStorage.array("files",3),
  standupLogBlockerImageUploadMiddleware,
  zodRequestValidation(logValidator.createLogSchema),
  StandupLogController.createLog,
);
router.patch("/:id", checkAuth(APP_ROLE.USER), StandupLogController.updateLog);
router.delete("/:id", checkAuth(APP_ROLE.USER), StandupLogController.deleteLog);
router.get("/:id", checkAuth(APP_ROLE.USER), StandupLogController.getLogById);
router.get("/",checkAuth(APP_ROLE.USER),StandupLogController.getLogs);
router.get(
  "/workspace/:workspaceId",
  checkAuth(APP_ROLE.USER),
  teamAuth(TEAM_ROLE.ADMIN),
  StandupLogController.getLogsByWorkspaceId,
);
router.get(
  "/workspace/:workspaceId/blocker/:blocker",
  checkAuth(APP_ROLE.USER),
  teamAuth(TEAM_ROLE.ADMIN),
  StandupLogController.getAllBlockerLogs,
);
router.delete(
  "/workspace/:workspaceId/:id",
  checkAuth(APP_ROLE.USER),
  teamAuth(TEAM_ROLE.ADMIN),
  StandupLogController.deleteLogFromWorkspace,
);

export const standupLogRoutes = router;
