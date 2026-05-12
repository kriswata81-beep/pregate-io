"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AffiliatesPage() {
  const router = useRouter();
  const [affiliateCode, setAffiliateCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [referrals, setReferrals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/auth/login"); return; }
      const { data: org } = await supabase.from("pg_orgs").select("affiliate_code, affiliate_earnings_cents").eq("owner_id", session.user.id).single();
      if (org) {
        setAffiliateCode(org.affiliate_code ?? "");
        setEarnings(org.affiliate_earnings_cents ?? 0);
      }
      setLoading(false);
    });
  }, [router]);

  const referralUrl = `https://pregate.io?ref=${affiliateCode}`;

  async function copy() {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui", fontSize: 14 }}>Loading...</p></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Inter, system-ui, sans-serif", color: "#e8e8f0" }}>
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/dashboard" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Dashboard</Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Affiliate Program</span>
      </nav>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>💰 Earn with Pregate</h1>
        <p style={{ fontSize: 16, color: "rgba(232,232,240,0.5)", lineHeight: 1.75, marginBottom: 40 }}>
          Share your link. Earn <strong style={{ color: "#fbbf24" }}>20% recurring commission</strong> for every person you refer who upgrades — forever, not just the first month.
        </p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Total earned", value: `$${(earnings / 100).toFixed(2)}` },
            { label: "Active referrals", value: referrals },
            { label: "Your commission", value: "20%" },
          ].map(s => (
            <div key={s.label} style={{ padding: 20, borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label.toUpperCase()}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#fbbf24" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: 24, marginBottom: 32 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Your referral link</p>
          <p style={{ fontSize: 13, color: "rgba(232,232,240,0.45)", marginBottom: 16 }}>Anyone who signs up through this link and upgrades earns you 20% every month.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralUrl}</div>
            <button onClick={copy} style={{ background: copied ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: copied ? "#4ade80" : "#fbbf24", borderRadius: 8, padding: "11px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {copied ? "Copied! ✓" : "Copy link"}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "rgba(255,255,255,0.7)" }}>How it works</p>
          {[
            { step: "1", text: "Share your link anywhere — Twitter, your newsletter, to friends launching products" },
            { step: "2", text: "They sign up for Pregate and upgrade to Starter ($29/mo) or Pro ($79/mo)" },
            { step: "3", text: "You earn 20% every month they stay — $5.80/mo per Starter, $15.80/mo per Pro" },
            { step: "4", text: "Payouts via PayPal or bank transfer when you hit $50" },
          ].map(item => (
            <div key={item.step} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fbbf24", flexShrink: 0 }}>{item.step}</div>
              <p style={{ fontSize: 14, color: "rgba(232,232,240,0.6)", lineHeight: 1.6, paddingTop: 4 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}