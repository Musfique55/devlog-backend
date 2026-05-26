import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { APP_ROLE } from "../../../generated/prisma/enums";
import { checkoutController } from "./checkout.controller";
import { paymentController } from "../payment/payment.controller";

const router = Router();

router.get("/", checkAuth(APP_ROLE.USER), paymentController.paymentHistory);
router.get("/:transactionId", paymentController.checkPaymentStatus);

router.post(
  "/create-checkout-session",
  checkAuth(APP_ROLE.USER),
  checkoutController.createCheckoutSession,
);
router.patch(
  "/cancel-subscription",
  checkAuth(APP_ROLE.USER),
  paymentController.cancelUserSubscription,
);

export const checkoutRoutes = router;
