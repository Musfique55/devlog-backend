import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/browser";
import zodRequestValidation from "../../helper/zodRequestValidation";
import { AdminValidator } from "./admin.validator";

const router = Router();

router.get("/users",checkAuth(APP_ROLE.SUPER_ADMIN),adminController.getAllUsers);
router.patch("/users/:userId",checkAuth(APP_ROLE.SUPER_ADMIN),zodRequestValidation(AdminValidator.updateUserSchema),adminController.updateUserActivityStatus);
router.get("/workspaces",checkAuth(APP_ROLE.SUPER_ADMIN),adminController.getAllWorkSpaces);

export const adminRoutes = router;