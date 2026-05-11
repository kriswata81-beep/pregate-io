import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { org_id, plan } = session.metadata ?? {};

      if (org_id && plan) {
        await admin
          .from("pg_orgs")
          .update({
            plan,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", org_id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await admin
        .from("pg_orgs")
        .update({ plan: "free", stripe_subscription_id: null })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const priceId = sub.items.data[0]?.price.id;

      // Map price ID back to plan name
      const { PLANS } = await import("@/lib/stripe");
      let plan = "free";
      if (priceId === PLANS.starter.stripePriceId) plan = "starter";
      else if (priceId === PLANS.pro.stripePriceId) plan = "pro";

      await admin
        .from("pg_orgs")
        .update({ plan })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
