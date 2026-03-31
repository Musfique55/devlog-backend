import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/enums";
import { checkoutController } from "./checkout.controller";

const router = Router();

router.post("/create-checkout-session",checkAuth(APP_ROLE.USER),checkoutController.createCheckoutSession);

export const checkoutRoutes = router;