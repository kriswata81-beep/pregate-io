import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();

  // Find free orgs that are at 80%+ of their 50 signup limit
  // and haven't been nudged in the last 7 days
  const { data: orgs } = await admin
    .from("pg_orgs")
    .select("id, owner_id, plan")
    .eq("plan", "free");

  let nudged = 0;

  for (const org of orgs ?? []) {
    // Count total signups for this org
    const { data: waitlists } = await admin
      .from("pg_waitlists")
      .select("id")
      .eq("org_id", org.id);

    if (!waitlists?.length) continue;

    const { count } = await admin
      .from("pg_waitlist_signups")
      .select("*", { count: "exact", head: true })
      .in("waitlist_id", waitlists.map((w: { id: string }) => w.id));

    if ((count ?? 0) < 40) continue; // Not at 80% yet

    // Check if nudge was sent recently
    const { data: recentNudge } = await admin
      .from("pg_nudge_log")
      .select("id")
      .eq("org_id", org.id)
      .eq("nudge_type", "upgrade_80pct")
      .gte("sent_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (recentNudge) continue;

    // Get user email
    const { data: userData } = await admin.auth.admin.getUserById(org.owner_id);
    if (!userData?.user?.email) continue;

    // Send nudge email
    try {
      await resend.emails.send({
        from: "Pregate <hello@pregate.io>",
        to: userData.user.email,
        subject: `🔴 You're almost full — ${count}/50 signups`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
            <h2 style="font-size:22px;font-weight:700;margin-bottom:8px">You're getting popular 🚀</h2>
            <p style="color:#666;line-height:1.7">Your waitlist has <strong>${count} signups</strong> — you're at ${Math.round(((count ?? 0) / 50) * 100)}% of your free plan limit.</p>
            <p style="color:#666;line-height:1.7">Upgrade to <strong>Starter ($29/mo)</strong> to unlock 1,000 signups, 5 waitlists, custom branding, and email notifications.</p>
            <a href="https://pregate.io/dashboard/billing" style="display:inline-block;margin-top:20px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px">Upgrade now →</a>
            <p style="margin-top:32px;font-size:12px;color:#999">You're receiving this because you use Pregate. <a href="https://pregate.io/dashboard" style="color:#999">Manage your account</a></p>
          </div>
        `,
      });

      // Log the nudge
      await admin.from("pg_nudge_log").insert({ org_id: org.id, nudge_type: "upgrade_80pct" });
      nudged++;
    } catch {
      // Continue even if one email fails
    }
  }

  return NextResponse.json({ ok: true, nudged });
}