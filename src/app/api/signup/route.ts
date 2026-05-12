import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  lite: 250,
  growth: 1000,
  starter: 1000, // legacy alias
  pro: -1,
};

export async function POST(req: NextRequest) {
  const { waitlist_id, email, data, referred_by } = await req.json();
  if (!waitlist_id || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Get waitlist + org
  const { data: wl } = await db.from("pg_waitlists").select("org_id").eq("id", waitlist_id).single();
  if (!wl) return NextResponse.json({ error: "Waitlist not found" }, { status: 404 });

  const { data: org } = await db.from("pg_orgs").select("plan").eq("id", wl.org_id).single();
  const plan = org?.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? 50;

  // Check plan limit
  if (limit !== -1) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await db
      .from("pg_waitlist_signups")
      .select("id", { count: "exact", head: true })
      .eq("waitlist_id", waitlist_id)
      .gte("created_at", startOfMonth.toISOString());
    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: "This waitlist has reached its signup limit." }, { status: 429 });
    }
  }

  // Check duplicate
  const { data: existing } = await db
    .from("pg_waitlist_signups")
    .select("referral_code")
    .eq("waitlist_id", waitlist_id)
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing) {
    return NextResponse.json({ referral_code: existing.referral_code, duplicate: true });
  }

  // Generate referral code
  const referral_code = nanoid(10);

  const { error } = await db.from("pg_waitlist_signups").insert({
    waitlist_id,
    email: email.toLowerCase().trim(),
    data: data ?? {},
    referral_code,
    referred_by: referred_by ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Increment referral count on referrer
  if (referred_by) {
    await db
      .from("pg_waitlist_signups")
      .update({ referral_count: db.rpc("increment", { x: 1 }) as unknown as number })
      .eq("referral_code", referred_by)
      .eq("waitlist_id", waitlist_id);
  }

  return NextResponse.json({ referral_code });
}
