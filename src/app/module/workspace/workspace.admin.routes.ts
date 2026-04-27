import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/enums";
import { workspaceController } from "./workspace.controller";

const router = Router();

router.get("/",checkAuth(APP_ROLE.SUPER_ADMIN),workspaceController.getAllWorkSpaces);

export const adminWorkspaceRoutes = router;