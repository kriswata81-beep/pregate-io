"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@/lib/stripe-plans";
import type { Org } from "@/lib/supabase";
import Link from "next/link";

export default function BillingPage() {
  const router = useRouter();
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/auth/login"); return; }
      const { data } = await supabase
        .from("pg_orgs")
        .select("*")
        .eq("owner_id", session.user.id)
        .single();
      setOrg(data);
      setLoading(false);
    });
  }, [router]);

  async function handleUpgrade(plan: "starter" | "pro") {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUpgrading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ plan }),
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
    } else {
      alert("Something went wrong. Please try again.");
      setUpgrading(null);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui", fontSize: 14 }}>Loading...</p>
    </div>
  );

  const currentPlan = org?.plan ?? "free";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Inter, system-ui, sans-serif", color: "#e8e8f0" }}>
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13 }}>← Dashboard</Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Billing</span>
      </nav>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Plans & billing</h1>
          <span style={{
            fontSize: 12, padding: "4px 12px", borderRadius: 100,
            background: "rgba(167,139,250,0.12)",
            border: "1px solid rgba(167,139,250,0.3)",
            color: "#a78bfa", fontWeight: 600,
            textTransform: "capitalize" as const,
          }}>Current: {currentPlan}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {(["free", "starter", "pro"] as const).map(planKey => {
            const plan = PLANS[planKey];
            const isCurrent = currentPlan === planKey;
            const isUpgrade = planKey === "starter" && currentPlan === "free"
              || planKey === "pro" && (currentPlan === "free" || currentPlan === "starter");

            return (
              <div key={planKey} style={{
                padding: "28px 24px",
                borderRadius: 12,
                border: `1px solid ${isCurrent ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
                background: isCurrent ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.02)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>{plan.name}</h3>
                  {isCurrent && (
                    <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, letterSpacing: "0.05em" }}>ACTIVE</span>
                  )}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 700 }}>
                    {planKey === "free" ? "$0" : planKey === "starter" ? "$29" : "$79"}
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", display: "grid", gap: 8, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: "rgba(232,232,240,0.6)" }}>
                      <span style={{ color: "#4ade80", flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div style={{
                    textAlign: "center", padding: "10px",
                    borderRadius: 7, border: "1px solid rgba(99,102,241,0.2)",
                    color: "rgba(167,139,250,0.5)", fontSize: 13,
                  }}>Current plan</div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(planKey as "starter" | "pro")}
                    disabled={!!upgrading}
                    style={{
                      width: "100%",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      borderRadius: 7,
                      padding: "11px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: upgrading ? "not-allowed" : "pointer",
                      opacity: upgrading ? 0.7 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {upgrading === planKey ? "Redirecting..." : `Upgrade to ${plan.name} →`}
                  </button>
                ) : (
                  <div style={{
                    textAlign: "center", padding: "10px",
                    borderRadius: 7, border: "1px solid rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.25)", fontSize: 13,
                  }}>Downgrade</div>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 32, textAlign: "center" }}>
          Questions? Email us at hello@pregate.io
        </p>
      </main>
    </div>
  );
}
