import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { waitlist_id, email, data } = await req.json();

    if (!waitlist_id || !email) {
      return NextResponse.json({ error: "waitlist_id and email are required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // Check waitlist exists and is active
    const { data: wl, error: wlErr } = await admin
      .from("pg_waitlists")
      .select("id, is_active, notify_email, name, org_id")
      .eq("id", waitlist_id)
      .single();

    if (wlErr || !wl) {
      return NextResponse.json({ error: "Waitlist not found" }, { status: 404 });
    }

    if (!wl.is_active) {
      return NextResponse.json({ error: "This waitlist is currently closed" }, { status: 403 });
    }

    // Check plan limits
    const { data: org } = await admin
      .from("pg_orgs")
      .select("plan")
      .eq("id", wl.org_id)
      .single();

    if (org?.plan === "free") {
      const { count } = await admin
        .from("pg_waitlist_signups")
        .select("id", { count: "exact", head: true })
        .eq("waitlist_id", waitlist_id);

      if ((count ?? 0) >= 50) {
        return NextResponse.json({ error: "This waitlist has reached its free plan limit. Please contact the organizer." }, { status: 429 });
      }
    }

    // Upsert (prevent duplicate email per waitlist)
    const { error: insertErr } = await admin
      .from("pg_waitlist_signups")
      .upsert({
        waitlist_id,
        email: email.trim().toLowerCase(),
        data: data ?? {},
      }, { onConflict: "waitlist_id,email", ignoreDuplicates: true });

    if (insertErr) {
      console.error("[signup] insert error:", insertErr);
      return NextResponse.json({ error: "Failed to record signup" }, { status: 500 });
    }

    // Send notification email (fire-and-forget, non-fatal)
    if (wl.notify_email && process.env.RESEND_API_KEY) {
      sendNotificationEmail(wl.notify_email, wl.name, email, data ?? {}).catch(err =>
        console.warn("[signup] notification failed:", err)
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[signup] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function sendNotificationEmail(
  to: string,
  waitlistName: string,
  newEmail: string,
  data: Record<string, string>
) {
  const dataLines = Object.entries(data)
    .filter(([k]) => k !== "email")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Pregate <notify@pregate.io>",
      to,
      subject: `New signup: ${waitlistName}`,
      text: `New signup on "${waitlistName}"\n\nEmail: ${newEmail}\n${dataLines}\n\n— Pregate`,
    }),
  });
}
