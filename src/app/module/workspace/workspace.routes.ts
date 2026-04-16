import { Router } from "express";
import { workspaceController } from "./workspace.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE, TEAM_ROLE } from "../../../generated/prisma/enums";
import { teamAuth } from "../../middleware/TeamAuth";
import zodRequestValidation from "../../helper/zodRequestValidation";
import { workspaceValidation } from "./workspace.validation";
import { requiredPro } from "../../middleware/requiredPro";

const router = Router();

router.get("/me",checkAuth(APP_ROLE.USER),workspaceController.getWorkspacesByUserId);  
router.get("/me/stats",checkAuth(APP_ROLE.USER),workspaceController.getUsersOverallWorkspaceStats);       
router.get("/",checkAuth(APP_ROLE.SUPER_ADMIN),workspaceController.getAllWorkSpaces);
router.get("/:workspaceId/members",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),teamAuth(TEAM_ROLE.ADMIN),workspaceController.getWorkspaceMembers);
router.get("/:workspaceId",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),teamAuth(TEAM_ROLE.ADMIN,TEAM_ROLE.MEMBER),workspaceController.getWorkSpaceById);
router.get("/:workspaceId/stats",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),teamAuth(TEAM_ROLE.ADMIN),workspaceController.getWorkspaceStats);
router.post("/create-workspace",checkAuth(APP_ROLE.USER),requiredPro,zodRequestValidation(workspaceValidation.validateWorkSpaceCreate),workspaceController.createWorkspace);
router.post("/:workspaceId/invite",checkAuth(APP_ROLE.USER),requiredPro,teamAuth(TEAM_ROLE.ADMIN),workspaceController.inviteMember);
router.patch("/:workspaceId",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),requiredPro,teamAuth(TEAM_ROLE.ADMIN),zodRequestValidation(workspaceValidation.validateWorkSpaceUpdate),workspaceController.updateWorkSpace);
router.delete("/:workspaceId",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),teamAuth(TEAM_ROLE.ADMIN),workspaceController.deleteWorkSpace);






export const workspaceRoutes = router;