import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { PaymentStatus, PLAN } from "../../../generated/prisma/enums";
import { sendEmail } from "../../utils/sendEmail";
import { envVars } from "../../config/env";

const stripeWebhook = async (event: Stripe.Event) => {
  const existing = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });


  if (existing) {
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userProfileId = session.metadata?.userId;
        const paymentIntentId = session.payment_intent;

        if (!paymentIntentId) {
          throw new AppError("no payment intent id found", 404);
        }

        if (!userProfileId) {
          throw new AppError("no user profile id found", 404);
        }

        await prisma.$transaction(async (tx) => {
          const paymentData = await tx.payment.create({
            data: {
              userId: session.metadata!.userId as string,
              amount: session.amount_total! / 100,
              transactionId: session.id,
              status: PaymentStatus.SUCCESS,
              stripeEventId: event.id,
              paymentGatewayData: session as any,
              invoiceUrl: session.invoice as string,
            },
          });
          await tx.user.update({
            where: {
              id: userProfileId,
            },
            data: {
              plan: PLAN.PRO,
              expiresAt: new Date(
                new Date(paymentData.createdAt).setMonth(
                  new Date(paymentData.createdAt).getMonth() + 1,
                ),
              ),
            },
          });
          return paymentData;
        });

        try {
          await sendEmail({
            to: session.metadata!.email as string,
            subject: "🎉 Welcome to DevLog Pro!",
            templateName: "payment-success",
            templateData: {
              name: session.metadata!.name,
              transactionId: session.id,
              date: new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
              amount: (session.amount_total! / 100).toFixed(2), // "20.00"
              dashboardUrl: `${envVars.FRONTEND_URL}/dashboard`,
            },
          });
        } catch (error) {
          console.log("email sending error",error);
        }

        console.log("proceed checkout.session.completed successfully");
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(
          `checkout session expired ${session.id}. Marking payment as failed`,
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const session = event.data.object as Stripe.PaymentIntent;
        console.log(
          `payment intent failed ${session.id}. Marking payment as failed`,
        );
        break;
      }
      default: {
        console.log(`Unhandled event type ${event.type}`);
        break;
      }
    }
  } catch (error) {
    throw error;
  }
};

const expiredSubscription = async () => {
  await prisma.user.updateMany({
    where: {
      plan: PLAN.PRO,
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      plan: PLAN.FREE,
      expiresAt: null,
    },
  });
};

export const paymentServices = {
  stripeWebhook,
  expiredSubscription,
};
