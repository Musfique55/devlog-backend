import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/enums";
import { UserController } from "./user.controller";
import zodRequestValidation from "../../helper/zodRequestValidation";
import { UserValidator } from "./user.validator";

const router = Router();

router.get("/",checkAuth(APP_ROLE.SUPER_ADMIN),UserController.getAllUsers);
router.get("/:userId",checkAuth(APP_ROLE.SUPER_ADMIN),UserController.getUserById);
router.patch("/:userId",checkAuth(APP_ROLE.SUPER_ADMIN),zodRequestValidation(UserValidator.updateUserSchema),UserController.updateUserActivityStatus);
router.delete("/:userId",checkAuth(APP_ROLE.SUPER_ADMIN),UserController.deleteUser);


export const userRoutes = router;