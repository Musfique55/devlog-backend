import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";
import zodRequestValidation from "../../helper/zodRequestValidation";
import { userValidator } from "./user.validator";

const router = Router();

router.get("/",checkAuth(APP_ROLE.SUPER_ADMIN),userController.getAllUsers);
router.patch("/:userId",checkAuth(APP_ROLE.SUPER_ADMIN),zodRequestValidation(userValidator.updateUserSchema),userController.updateUserActivityStatus);



export const adminUserRoutes = router;