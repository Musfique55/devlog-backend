import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/enums";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get("/",checkAuth(APP_ROLE.SUPER_ADMIN),dashboardController.dashboardForSuperAdmin)
router.get("/yearly-profit",checkAuth(APP_ROLE.SUPER_ADMIN),dashboardController.getFullYearProfit);
router.get("/user-growth",checkAuth(APP_ROLE.SUPER_ADMIN),dashboardController.userGrowth);


export const adminDashboardRoutes = router;