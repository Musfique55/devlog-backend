import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "@prisma/client";
import { dashboardController } from "./dashboard.controller";
import { teamAuth } from "../../middleware/TeamAuth";
import { TEAM_ROLE } from "../../../generated/prisma/enums";

const router = Router();

router.get("/me",checkAuth(APP_ROLE.USER),dashboardController.dashboardForSoloUser);
router.get("/workspace/:workspaceId",checkAuth(APP_ROLE.USER),teamAuth(TEAM_ROLE.MEMBER,TEAM_ROLE.ADMIN),dashboardController.dashboardForTeamUser);
router.get("/super-admin",checkAuth(APP_ROLE.SUPER_ADMIN),dashboardController.dashboardForSuperAdmin);
router.get("/yearly-profit",checkAuth(APP_ROLE.SUPER_ADMIN),dashboardController.getFullYearProfit);
router.get("/user-growth",checkAuth(APP_ROLE.SUPER_ADMIN),dashboardController.userGrowth);


export const dashboardRoutes = router;