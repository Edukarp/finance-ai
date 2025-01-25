import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (request: Request) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.error();
  }

  const text = await request.text();

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.error();
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }
  const events = stripe.webhooks.constructEvent(
    text,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (events.type) {
    case "invoice.paid": {
      const { customer, subscription, subscription_details } =
        events.data.object;
      const cleakUserId = subscription_details?.metadata?.clerk_user_id;
      if (!cleakUserId) {
        return NextResponse.error();
      }
      await clerkClient().users.updateUser(cleakUserId, {
        privateMetadata: {
          stripeCustomerId: customer,
          stripeSubscriptionId: subscription,
        },
        publicMetadata: {
          subscriptionPlan: "premium",
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = await stripe.subscriptions.retrieve(
        events.data.object.id,
      );

      const clerkUserId = subscription.metadata.clerk_user_id;
      if (!clerkUserId) {
        return NextResponse.error();
      }
      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: null, //ou "free" se for tratado
        },
      });
    }
  }
  return NextResponse.json({ received: true });
};
