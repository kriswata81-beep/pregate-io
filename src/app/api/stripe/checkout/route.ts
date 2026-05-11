import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json() as { plan: string };

    if (plan !== "starter" && plan !== "pro") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const validatedPlan = plan as "starter" | "pro";

    // Get session from cookie
    const cookieStore = await cookies();
    const supabaseCookie = cookieStore.get("sb-access-token")?.value;

    // Fallback: get user from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") ?? supabaseCookie;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const admin = supabaseAdmin();
    const { data: org } = await admin
      .from("pg_orgs")
      .select("id, stripe_customer_id")
      .eq("owner_id", user.id)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get or create Stripe customer
    let customerId = org.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { org_id: org.id, user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("pg_orgs")
        .update({ stripe_customer_id: customerId })
        .eq("id", org.id);
    }

    const planConfig = PLANS[validatedPlan];
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      metadata: { org_id: org.id, plan: validatedPlan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
