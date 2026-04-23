import { Router } from "express";
import { authController } from "./auth.controller";
import zodRequestValidation from "../../helper/zodRequestValidation";
import { authSchemas } from "./auth.validator";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/enums";
import { multerStorage } from "../../config/multer.config";

const router = Router();

router.post("/login", zodRequestValidation(authSchemas.loginSchema) ,authController.loginUser);
router.post("/register", zodRequestValidation(authSchemas.registerSchema), authController.registerUser);
router.patch("/update-profile", multerStorage.single("file"),checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN), 
zodRequestValidation(authSchemas.updateProfileSchema), authController.updateProfile);
router.post("/refresh-token",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),authController.getNewTokens);
router.post("/logout", checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN), authController.logoutUser);
router.get("/me", checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN), authController.getMe);
router.delete("/delete-account",checkAuth(APP_ROLE.USER), authController.deleteAccount);


export const authRoutes = router;