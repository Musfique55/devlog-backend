import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE, TEAM_ROLE } from "../../../generated/prisma/enums";
import { teamAuth } from "../../middleware/TeamAuth";
import { inviteController } from "./invite.controller";

const router = Router();

router.post("/",checkAuth(APP_ROLE.USER),teamAuth(TEAM_ROLE.ADMIN),inviteController.inviteMember);
router.get("/accept/:token",inviteController.acceptInvite);

export const inviteRoutes = router;