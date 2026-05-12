import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  lite: 250,
  growth: 1000,
  starter: 1000,
  pro: -1,
};

function genCode(len = 10): string {
  return randomBytes(len).toString("base64url").slice(0, len);
}

export async function POST(req: NextRequest) {
  const { waitlist_id, email, data, referred_by } = await req.json();
  if (!waitlist_id || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: wl } = await db.from("pg_waitlists").select("org_id").eq("id", waitlist_id).single();
  if (!wl) return NextResponse.json({ error: "Waitlist not found" }, { status: 404 });

  const { data: org } = await db.from("pg_orgs").select("plan").eq("id", wl.org_id).single();
  const plan = org?.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? 50;

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

  const { data: existing } = await db
    .from("pg_waitlist_signups")
    .select("referral_code")
    .eq("waitlist_id", waitlist_id)
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing) {
    return NextResponse.json({ referral_code: existing.referral_code, duplicate: true });
  }

  const referral_code = genCode();

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

  if (referred_by) {
    await db.rpc("increment_referral", { ref_code: referred_by, wl_id: waitlist_id });
  }

  return NextResponse.json({ referral_code });
}
