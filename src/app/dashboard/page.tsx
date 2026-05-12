"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Org, Waitlist } from "@/lib/supabase";
import Link from "next/link";

const PLAN_LIMITS: Record<string, { signups: number; waitlists: number }> = {
  free:    { signups: 50,   waitlists: 1  },
  starter: { signups: 1000, waitlists: 5  },
  pro:     { signups: -1,   waitlists: -1 },
};

function Milestone({ count }: { count: number }) {
  const milestones = [
    { n: 1,   emoji: "🌱", label: "First signup!" },
    { n: 10,  emoji: "🔥", label: "10 signups!"  },
    { n: 50,  emoji: "💎", label: "50 signups!"  },
    { n: 100, emoji: "🚀", label: "100 signups!" },
    { n: 500, emoji: "⚡", label: "500 signups!" },
  ];
  const reached = milestones.filter(m => count >= m.n);
  if (!reached.length) return null;
  const latest = reached[reached.length - 1];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#fbbf24" }}>
      {latest.emoji} {latest.label}
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max < 0 ? 0 : Math.min((value / max) * 100, 100);
  const isWarning = pct >= 80;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
        <span>{value.toLocaleString()} signups</span>
        <span style={{ color: isWarning ? "#f87171" : undefined }}>{max < 0 ? "∞" : `${max} limit`}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: isWarning ? "linear-gradient(90deg,#f59e0b,#ef4444)" : color, borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [waitlists, setWaitlists] = useState<Waitlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [signupCounts, setSignupCounts] = useState<Record<string, number>>({});
  const [showNudge, setShowNudge] = useState(false);

  const loadData = useCallback(async (userId: string) => {
    let { data: orgData } = await supabase.from("pg_orgs").select("*").eq("owner_id", userId).single();
    if (!orgData) {
      const { data: newOrg } = await supabase.from("pg_orgs").insert({ owner_id: userId, name: "My Organization", slug: `org-${userId.slice(0, 8)}` }).select().single();
      orgData = newOrg;
    }
    setOrg(orgData);
    if (!orgData) return;

    const { data: wl } = await supabase.from("pg_waitlists").select("*").eq("org_id", orgData.id).order("created_at", { ascending: false });
    setWaitlists(wl ?? []);

    if (wl && wl.length > 0) {
      const { data: counts } = await supabase.from("pg_waitlist_signups").select("waitlist_id").in("waitlist_id", wl.map((w: Waitlist) => w.id));
      const countMap: Record<string, number> = {};
      for (const row of counts ?? []) countMap[row.waitlist_id] = (countMap[row.waitlist_id] ?? 0) + 1;
      setSignupCounts(countMap);

      // Show upgrade nudge if any waitlist is at 80%+ of free limit
      const plan = orgData?.plan ?? "free";
      const limit = PLAN_LIMITS[plan]?.signups ?? 50;
      if (plan === "free" && limit > 0) {
        const totalSignups = Object.values(countMap).reduce((a: number, b: number) => a + b, 0);
        if (totalSignups >= limit * 0.8) setShowNudge(true);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/auth/login"); return; }
      setUser({ id: session.user.id, email: session.user.email ?? "" });
      loadData(session.user.id);
    });
  }, [router, loadData]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const plan = org?.plan ?? "free";
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const totalSignups = Object.values(signupCounts).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Inter, system-ui, sans-serif", color: "#e8e8f0" }}>
      {/* TOP NAV */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>Pregate</span>
          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>·</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/affiliates" style={{ fontSize: 12, color: "#fbbf24", textDecoration: "none", padding: "5px 12px", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 6, fontWeight: 500 }}>💰 Earn with affiliates</Link>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{user?.email}</span>
          <button onClick={handleSignOut} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* UPGRADE NUDGE — pulsing warning when 80%+ full */}
        {showNudge && (
          <div style={{ padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", animation: "pulse 2s infinite" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#f87171", marginBottom: 2 }}>🔴 You&apos;re almost at your limit</p>
              <p style={{ fontSize: 13, color: "rgba(232,232,240,0.5)" }}>Upgrade now to keep collecting signups — don&apos;t lose momentum.</p>
            </div>
            <Link href="/dashboard/billing" style={{ background: "linear-gradient(135deg, #ef4444, #f97316)", color: "white", textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "10px 20px", borderRadius: 8, whiteSpace: "nowrap" }}>Upgrade now →</Link>
          </div>
        )}

        {/* PLAN BANNER */}
        <div style={{ padding: "14px 20px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.06)", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Plan: </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", textTransform: "capitalize" }}>{plan}</span>
            {plan === "free" && (
              <div style={{ marginTop: 8 }}>
                <ProgressBar value={totalSignups} max={limits.signups} color="linear-gradient(90deg,#3b82f6,#8b5cf6)" />
              </div>
            )}
          </div>
          {plan === "free" && (
            <Link href="/dashboard/billing" style={{ fontSize: 13, color: "#60a5fa", textDecoration: "none", fontWeight: 500, marginLeft: 20 }}>Upgrade plan →</Link>
          )}
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Total signups", value: totalSignups },
            { label: "Active waitlists", value: waitlists.filter((w: Waitlist) => w.is_active).length },
            { label: "Total waitlists", value: waitlists.length },
          ].map(stat => (
            <div key={stat.label} style={{ padding: "20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 10 }}>{stat.label.toUpperCase()}</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* WAITLISTS HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Your waitlists</h2>
          {(plan === "free" ? waitlists.length < 1 : plan === "starter" ? waitlists.length < 5 : true) ? (
            <Link href="/dashboard/waitlist/new" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 8 }}>+ New waitlist</Link>
          ) : (
            <Link href="/dashboard/billing" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)" }}>Upgrade for more waitlists →</Link>
          )}
        </div>

        {/* WAITLIST LIST */}
        {waitlists.length === 0 ? (
          <div style={{ padding: "60px 24px", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.1)", textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 16 }}>🚀</p>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No waitlists yet</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Create your first waitlist and start collecting signups.</p>
            <Link href="/dashboard/waitlist/new" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Create your first waitlist →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {waitlists.map((wl: Waitlist) => {
              const count = signupCounts[wl.id] ?? 0;
              return (
                <div key={wl.id} style={{ padding: "20px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{wl.name}</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: wl.is_active ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)", color: wl.is_active ? "#4ade80" : "rgba(255,255,255,0.3)", fontWeight: 600 }}>{wl.is_active ? "LIVE" : "DRAFT"}</span>
                        <Milestone count={count} />
                      </div>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>pregate.io/w/{wl.slug}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a href={`/w/${wl.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "7px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>View ↗</a>
                      <Link href={`/dashboard/waitlist/${wl.id}`} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 6, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>Manage →</Link>
                    </div>
                  </div>
                  <ProgressBar value={count} max={limits.signups} color="linear-gradient(90deg,#3b82f6,#8b5cf6)" />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}