import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";
import zodRequestValidation from "../../helper/zodRequestValidation";
import { userValidator } from "./user.validator";
import { multerStorage } from "../../config/multer.config";

const router = Router();

router.get("/me", checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN), userController.getMe);
router.patch("/",multerStorage.single("file"),checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN),zodRequestValidation(userValidator.updateProfileSchema), userController.updateProfile);
router.delete("/delete-account",checkAuth(APP_ROLE.USER,APP_ROLE.SUPER_ADMIN), userController.deleteAccount);



export const userRoutes = router;



