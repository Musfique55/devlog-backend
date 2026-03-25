import { Router } from "express";
import { workspaceController } from "./workspace.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE, TEAM_ROLE } from "../../../generated/prisma/enums";
import { teamAuth } from "../../middleware/TeamAuth";
import zodRequestValidation from "../../helper/zodRequestValidation";
import { workspaceValidation } from "./workspace.validation";

const router = Router();


router.post("/create-workspace",checkAuth(APP_ROLE.USER),zodRequestValidation(workspaceValidation.validateWorkSpaceCreate),workspaceController.createWorkspace);
router.get("/get-workspace/:id",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),teamAuth(TEAM_ROLE.ADMIN,TEAM_ROLE.MEMBER),workspaceController.getWorkSpaceById);
router.get("/get-all-workspaces",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),workspaceController.getAllWorkSpaces);
router.delete("/delete-workspace/:id",checkAuth(APP_ROLE.SUPER_ADMIN),workspaceController.deleteWorkSpace);
router.patch("/update-workspace/:id",checkAuth(APP_ROLE.SUPER_ADMIN),teamAuth(TEAM_ROLE.ADMIN),zodRequestValidation(workspaceValidation.validateWorkSpaceUpdate),workspaceController.updateWorkSpace)



export const workspaceRoutes = router;