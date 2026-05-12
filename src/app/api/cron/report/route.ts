import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();

  // Count metrics
  const { count: totalOrgs } = await admin.from("pg_orgs").select("*", { count: "exact", head: true });
  const { count: paidOrgs } = await admin.from("pg_orgs").select("*", { count: "exact", head: true }).neq("plan", "free");
  const { count: totalSignups } = await admin.from("pg_waitlist_signups").select("*", { count: "exact", head: true });
  const { count: weekSignups } = await admin.from("pg_waitlist_signups").select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  // Get MRR from Stripe
  let mrr = 0;
  try {
    const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
    mrr = subs.data.reduce((sum, sub) => {
      const monthly = sub.items.data.reduce((s, item) => {
        const price = item.price;
        const amount = price.unit_amount ?? 0;
        return s + (price.recurring?.interval === "year" ? Math.round(amount / 12) : amount);
      }, 0);
      return sum + monthly;
    }, 0);
  } catch { /* stripe not set up yet */ }

  const reportEmail = process.env.REPORT_EMAIL ?? "kwata81@yahoo.com";

  await resend.emails.send({
    from: "Pregate Reports <hello@pregate.io>",
    to: reportEmail,
    subject: `📊 Pregate Weekly Report — $${(mrr / 100).toFixed(2)} MRR`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
        <h2 style="font-size:22px;font-weight:700">Weekly Report 📊</h2>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr style="border-bottom:1px solid #eee"><td style="padding:12px 0;color:#666">MRR</td><td style="padding:12px 0;font-weight:700;font-size:18px">$${(mrr / 100).toFixed(2)}</td></tr>
          <tr style="border-bottom:1px solid #eee"><td style="padding:12px 0;color:#666">Total customers</td><td style="padding:12px 0;font-weight:600">${paidOrgs ?? 0}</td></tr>
          <tr style="border-bottom:1px solid #eee"><td style="padding:12px 0;color:#666">Total signups (all waitlists)</td><td style="padding:12px 0;font-weight:600">${totalSignups ?? 0}</td></tr>
          <tr style="border-bottom:1px solid #eee"><td style="padding:12px 0;color:#666">New signups this week</td><td style="padding:12px 0;font-weight:600">${weekSignups ?? 0}</td></tr>
          <tr><td style="padding:12px 0;color:#666">Total accounts</td><td style="padding:12px 0;font-weight:600">${totalOrgs ?? 0}</td></tr>
        </table>
        <a href="https://pregate.io/dashboard" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">View dashboard →</a>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, mrr, totalOrgs, paidOrgs, totalSignups });
}