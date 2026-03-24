import { Router } from "express";
import { authController } from "./auth.controller";
import zodRequestValidation from "../../helper/zodRequestValidation";
import { authSchemas } from "./auth.validator";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/enums";

const router = Router();

router.post("/login", zodRequestValidation(authSchemas.loginSchema) ,authController.loginUser);
router.post("/register", zodRequestValidation(authSchemas.registerSchema), authController.registerUser);
router.get("/refresh-token",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),authController.getNewTokens);
router.post("/logout", checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN), authController.logoutUser);


export const authRoutes = router;