"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Org, Waitlist } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [waitlists, setWaitlists] = useState<Waitlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [signupCounts, setSignupCounts] = useState<Record<string, number>>({});

  const loadData = useCallback(async (userId: string) => {
    // Load or create org
    let { data: orgData } = await supabase
      .from("pg_orgs")
      .select("*")
      .eq("owner_id", userId)
      .single();

    if (!orgData) {
      // Create org on first login
      const { data: newOrg } = await supabase
        .from("pg_orgs")
        .insert({ owner_id: userId, name: "My Organization", slug: `org-${userId.slice(0, 8)}` })
        .select()
        .single();
      orgData = newOrg;
    }

    setOrg(orgData);

    if (!orgData) return;

    // Load waitlists
    const { data: wl } = await supabase
      .from("pg_waitlists")
      .select("*")
      .eq("org_id", orgData.id)
      .order("created_at", { ascending: false });

    setWaitlists(wl ?? []);

    // Load signup counts
    if (wl && wl.length > 0) {
      const { data: counts } = await supabase
        .from("pg_waitlist_signups")
        .select("waitlist_id")
        .in("waitlist_id", wl.map(w => w.id));

      const countMap: Record<string, number> = {};
      for (const row of counts ?? []) {
        countMap[row.waitlist_id] = (countMap[row.waitlist_id] ?? 0) + 1;
      }
      setSignupCounts(countMap);
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Inter, system-ui, sans-serif", color: "#e8e8f0" }}>
      {/* ── TOP NAV ─────────────────────────────────────────────────── */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "white",
          }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>Pregate</span>
          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>·</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{user?.email}</span>
          <button
            onClick={handleSignOut}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.4)",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >Sign out</button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Plan banner */}
        <div style={{
          padding: "14px 20px",
          borderRadius: 10,
          border: "1px solid rgba(99,102,241,0.2)",
          background: "rgba(99,102,241,0.06)",
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Current plan: </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", textTransform: "capitalize" }}>
              {org?.plan ?? "free"}
            </span>
            {org?.plan === "free" && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>
                · 1 waitlist, 50 signups/mo
              </span>
            )}
          </div>
          <Link href="/dashboard/billing" style={{
            fontSize: 13,
            color: "#60a5fa",
            textDecoration: "none",
            fontWeight: 500,
          }}>Upgrade plan →</Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Total signups", value: Object.values(signupCounts).reduce((a, b) => a + b, 0) },
            { label: "Active waitlists", value: waitlists.filter(w => w.is_active).length },
            { label: "Total waitlists", value: waitlists.length },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: "20px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 10 }}>
                {stat.label.toUpperCase()}
              </p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Waitlists header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Your waitlists</h2>
          <Link href="/dashboard/waitlist/new" style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "white",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
            padding: "9px 18px",
            borderRadius: 8,
          }}>+ New waitlist</Link>
        </div>

        {/* Waitlist list */}
        {waitlists.length === 0 ? (
          <div style={{
            padding: "60px 24px",
            borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.1)",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 32, marginBottom: 16 }}>🚀</p>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No waitlists yet</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
              Create your first waitlist and start collecting signups.
            </p>
            <Link href="/dashboard/waitlist/new" style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 8,
            }}>Create your first waitlist →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {waitlists.map(wl => (
              <div key={wl.id} style={{
                padding: "20px 24px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{wl.name}</span>
                    <span style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 100,
                      background: wl.is_active ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)",
                      color: wl.is_active ? "#4ade80" : "rgba(255,255,255,0.3)",
                      fontWeight: 600,
                    }}>{wl.is_active ? "LIVE" : "DRAFT"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                    <span>pregate.io/w/{wl.slug}</span>
                    <span>·</span>
                    <span>{signupCounts[wl.id] ?? 0} signups</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <a
                    href={`/w/${wl.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12,
                      padding: "7px 14px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                      textDecoration: "none",
                    }}
                  >View page ↗</a>
                  <Link href={`/dashboard/waitlist/${wl.id}`} style={{
                    fontSize: 12,
                    padding: "7px 14px",
                    borderRadius: 6,
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    color: "#a78bfa",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}>Manage →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
