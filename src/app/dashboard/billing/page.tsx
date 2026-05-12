"use client";
import { useState } from "react";
import Link from "next/link";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    label: "Free forever",
    signups: "50 signups/mo",
    waitlists: "1 waitlist",
    features: ["Referral links built in", "CSV export", "Public waitlist page"],
    cta: "Current plan",
    highlight: false,
    gamified: false,
  },
  {
    id: "lite",
    name: "Lite",
    price: 9,
    label: "$9/mo",
    signups: "250 signups/mo",
    waitlists: "3 waitlists",
    features: ["Everything in Free", "🎮 Gamified position display", "Referral leaderboard", "Milestone emails"],
    cta: "Upgrade to Lite",
    highlight: false,
    gamified: true,
  },
  {
    id: "growth",
    name: "Growth",
    price: 29,
    label: "$29/mo",
    signups: "1,000 signups/mo",
    waitlists: "5 waitlists",
    features: ["Everything in Lite", "Custom branding", "Remove Powered by badge", "Email notifications"],
    cta: "Upgrade to Growth",
    highlight: true,
    gamified: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    label: "$79/mo",
    signups: "Unlimited signups",
    waitlists: "Unlimited waitlists",
    features: ["Everything in Growth", "API access", "Webhooks", "Priority support"],
    cta: "Upgrade to Pro",
    highlight: false,
    gamified: true,
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Inter, system-ui, sans-serif", color: "#e8e8f0" }}>
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>Pregate</span>
        </div>
        <Link href="/dashboard" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back to dashboard</Link>
      </nav>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>
            Simple, founder-friendly pricing
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 auto" }}>
            Start free. Upgrade when your waitlist grows.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {TIERS.map(tier => (
            <div key={tier.id} style={{
              padding: "28px 24px",
              borderRadius: 12,
              border: tier.highlight ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.07)",
              background: tier.highlight ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}>
              {tier.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 100, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: tier.highlight ? "#a78bfa" : "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.04em" }}>{tier.name.toUpperCase()}</p>
                <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  {tier.price === 0 ? "Free" : `$${tier.price}`}
                  {tier.price > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.35)" }}>/mo</span>}
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{tier.signups} · {tier.waitlists}</p>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", flex: 1 }}>
                {tier.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, paddingLeft: 18, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "#4ade80" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {tier.id === "free" ? (
                <Link href="/dashboard" style={{ display: "block", textAlign: "center", padding: "11px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none" }}>
                  {tier.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={loading === tier.id}
                  style={{
                    width: "100%",
                    background: tier.highlight ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(99,102,241,0.15)",
                    border: tier.highlight ? "none" : "1px solid rgba(99,102,241,0.3)",
                    color: "white",
                    borderRadius: 8,
                    padding: "11px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: loading === tier.id ? "not-allowed" : "pointer",
                    opacity: loading === tier.id ? 0.6 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {loading === tier.id ? "Loading..." : tier.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.2)", marginTop: 40 }}>
          All plans include the viral referral mechanic. Upgrade or cancel anytime.
        </p>
      </main>
    </div>
  );
}
