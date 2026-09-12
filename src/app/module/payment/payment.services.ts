import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import {
  PaymentStatus,
  PLAN,
  SubscriptionStatus,
} from "../../../generated/prisma/enums";
import { sendEmail } from "../../utils/sendEmail";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";

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

        console.log(
          "proceed checkout.session.completed successfully",
          session.id,
        );
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const intentedPayment = await prisma.payment.findUnique({
          where: {
            transactionId: invoice.id,
          },
        });

        if (intentedPayment) {
          console.log("payment already processed");
          return;
        }

        if (!customerId) {
          throw new AppError("no stripe customer id found", 404);
        }

        const user = await prisma.user.findUnique({
          where: {
            stripeCustomerId: customerId,
          },
        });

        if (!user) {
          throw new AppError("no user found", 404);
        }

        const subscriptionId = invoice.parent?.subscription_details
          ?.subscription as string;

        if (!subscriptionId) {
          throw new AppError("no subscription id found", 404);
        }

        const stripeSubscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        await prisma.$transaction(async (tx) => {
          const paymentData = await tx.payment.create({
            data: {
              userId: user.id,
              amount: invoice.amount_paid! / 100,
              transactionId: invoice.id,
              status: PaymentStatus.SUCCESS,
              stripeEventId: event.id,
              paymentGatewayData: invoice as any,
              invoiceUrl: invoice.hosted_invoice_url as string,
            },
          });
          await tx.subscription.upsert({
            where: {
              stripeSubscriptionId: subscriptionId,
            },
            update: {
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: new Date(
                stripeSubscription?.items?.data[0]?.current_period_start! *
                  1000,
              ),
              currentPeriodEnd: new Date(
                stripeSubscription?.items?.data[0]?.current_period_end! * 1000,
              ),
            },
            create: {
              userId: user.id,
              stripeSubscriptionId: subscriptionId,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: new Date(
                stripeSubscription?.items?.data[0]?.current_period_start! *
                  1000,
              ),
              currentPeriodEnd: new Date(
                stripeSubscription?.items?.data[0]?.current_period_end! * 1000,
              ),
              stripeCustomerId: customerId,
            },
          });
          await tx.user.update({
            where: {
              id: user.id,
            },
            data: {
              plan: PLAN.PRO,
              expiresAt: new Date(
                stripeSubscription?.items?.data[0]?.current_period_end! * 1000,
              ),
            },
          });
          return paymentData;
        });

        try {
          await sendEmail({
            to: user.email,
            subject: "🎉 Welcome to DevLog Pro!",
            templateName: "payment-success",
            templateData: {
              name: user.name,
              transactionId: invoice.id,
              date: new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
              amount: (invoice.amount_paid! / 100).toFixed(2), // "20.00"
              dashboardUrl: `${envVars.FRONTEND_URL}/dashboard`,
            },
          });
        } catch (error) {
          console.log("email sending error", error);
        }
        console.log(`invoice paid ${invoice.id}`);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.parent?.subscription_details
          ?.subscription as string;

        if (!subscriptionId) {
          throw new AppError("no subscription id found", 404);
        }

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
          data: {
            status: SubscriptionStatus.PAST_DUE,
          },
        });
        console.log(`invoice payment failed ${invoice.id}`);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        try {
          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: {
                stripeCustomerId: customerId,
              },
              data: {
                plan: PLAN.FREE,
                expiresAt: null,
              },
            });
            await tx.subscription.update({
              where: {
                stripeSubscriptionId: subscription.id,
              },
              data: {
                status: SubscriptionStatus.CANCELLED,
              },
            });
          });
        } catch (error) {
          console.log("error occured during subscription deletion", error);
        }

        console.log(`customer subscription deleted ${subscription.id}`);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.customer as string;

        console.log(`payment intent failed for customer ${customerId}`);
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

const checkPaymentStatus = async (transactionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      transactionId,
    },
  });
  return {
    orderId: payment?.id,
    amount: payment?.amount,
    status: payment?.status,
  };
};

const cancelSubscription = async (userId: string) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    });

    await stripe.subscriptions.update(subscription?.stripeSubscriptionId!, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: {
        userId,
      },
      data: {
        cancelAtPeriodEnd: true,
        cancelAt: new Date(),
      },
    });
  } catch (error) {
    throw error;
  }
};

const paymentHistory = async (userId: string) => {
  try {
    const data = await prisma.payment.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        invoiceUrl: true,
      },
      take: 3,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const paymentServices = {
  stripeWebhook,
  checkPaymentStatus,
  cancelSubscription,
  paymentHistory,
};
