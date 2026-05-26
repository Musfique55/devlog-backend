import status from "http-status";
import { PLAN } from "../../../generated/prisma/enums";
import AppError from "../../helper/AppError";
import { IRequestUser } from "../../middleware/checkAuth";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";

const createCheckoutSession = async (user: IRequestUser) => {
  if (user.plan === PLAN.PRO) {
    throw new AppError(
      "user already subscribed to pro plan",
      status.BAD_REQUEST,
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer: user.stripeCustomerId as string,
    line_items: [
      {
        price: envVars.STRIPE.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
    success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment/failed`,
  });

  return {
    paymentUrl: session.url,
  };
};

export const checkoutServices = {
  createCheckoutSession,
};
