import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import Stripe from "stripe";
import { stripe } from "../../config/stripe.config";
import { paymentServices } from "./payment.services";
import { envVars } from "../../config/env";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  const secret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature as string,
      secret,
    );
  } catch (error: any) {
    console.log(`Error processing webhook event: ${error.message}`);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  try {
    const result = await paymentServices.stripeWebhook(event);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "webhook event processed successfully",
      data: result,
    });
  } catch (error : any) {
    res.status(status.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
});

export const paymentController = {
  handleStripeWebhook,
};

