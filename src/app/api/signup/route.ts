import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { waitlist_id, email, data, referred_by } = body as {
      waitlist_id: string;
      email: string;
      data?: Record<string, string>;
      referred_by?: string;
    };

    if (!waitlist_id || !email) {
      return NextResponse.json({ error: "waitlist_id and email are required" }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // Check waitlist exists and is active
    const { data: wl } = await admin
      .from("pg_waitlists")
      .select("id, org_id, notify_email")
      .eq("id", waitlist_id)
      .eq("is_active", true)
      .single();

    if (!wl) {
      return NextResponse.json({ error: "Waitlist not found or inactive" }, { status: 404 });
    }

    // Check org plan limits
    const { data: org } = await admin.from("pg_orgs").select("plan").eq("id", wl.org_id).single();
    const planLimits: Record<string, number> = { free: 50, starter: 1000, pro: -1 };
    const limit = planLimits[org?.plan ?? "free"] ?? 50;

    if (limit > 0) {
      const { count } = await admin.from("pg_waitlist_signups").select("*", { count: "exact", head: true }).eq("waitlist_id", waitlist_id);
      if ((count ?? 0) >= limit) {
        return NextResponse.json({ error: "This waitlist has reached its signup limit." }, { status: 429 });
      }
    }

    // Check for duplicate
    const { data: existing } = await admin
      .from("pg_waitlist_signups")
      .select("id, referral_code")
      .eq("waitlist_id", waitlist_id)
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ ok: true, referral_code: existing.referral_code, duplicate: true });
    }

    // Insert signup
    const { data: signup, error: insertErr } = await admin
      .from("pg_waitlist_signups")
      .insert({
        waitlist_id,
        email: email.toLowerCase().trim(),
        data: data ?? {},
        referred_by: referred_by ?? null,
      })
      .select("id, referral_code")
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({ ok: true, referral_code: signup?.referral_code ?? null });
  } catch (err) {
    console.error("[api/signup] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}