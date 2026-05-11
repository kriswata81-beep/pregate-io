import Link from "next/link";

const FEATURES = [
  {
    icon: "⚡",
    title: "Live in 60 seconds",
    desc: "No code. No config. Create your waitlist, share the link, collect signups.",
  },
  {
    icon: "🎛️",
    title: "Custom fields",
    desc: "Name, role, territory, phone — ask what matters to your launch. Build any form.",
  },
  {
    icon: "🔔",
    title: "Instant notifications",
    desc: "Email alert every time someone joins. Know the moment your audience moves.",
  },
  {
    icon: "📊",
    title: "Dashboard + CSV export",
    desc: "See every signup, filter by field, export anytime. Your data, always.",
  },
  {
    icon: "🎨",
    title: "Fully branded",
    desc: "Custom headline, logo, CTA, success message. Looks like yours from day one.",
  },
  {
    icon: "🔒",
    title: "Built on Supabase",
    desc: "Row-level security, encrypted at rest, EU/US hosting. Enterprise-grade from the start.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "Perfect to launch and test your first waitlist.",
    features: ["1 waitlist", "50 signups/mo", "Basic form fields", "CSV export"],
    cta: "Start free",
    href: "/auth/login",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    desc: "For builders who are serious about their launch.",
    features: ["5 waitlists", "1,000 signups/mo", "Custom fields", "Email notifications on every signup", "Custom branding", "CSV export"],
    cta: "Start Starter",
    href: "/auth/login?plan=starter",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    desc: "For teams running multiple products at once.",
    features: ["Unlimited waitlists", "Unlimited signups", "Webhook notifications", "API access", "White-label", "Priority support"],
    cta: "Start Pro",
    href: "/auth/login?plan=pro",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(12px)",
        padding: "0 24px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700,
          }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Pregate</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/auth/login" style={{
            color: "rgba(255,255,255,0.6)",
            textDecoration: "none",
            fontSize: 14,
            padding: "8px 16px",
            borderRadius: 8,
            transition: "color 0.2s",
          }}>Log in</Link>
          <Link href="/auth/login" style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "white",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
            padding: "8px 18px",
            borderRadius: 8,
          }}>Get started free →</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "100px 24px 80px",
        textAlign: "center",
        maxWidth: 760,
        margin: "0 auto",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: 100,
          padding: "6px 16px",
          fontSize: 12,
          color: "#60a5fa",
          letterSpacing: "0.08em",
          fontWeight: 600,
          marginBottom: 32,
        }}>
          WAITLIST INFRASTRUCTURE FOR BUILDERS
        </div>

        <h1 style={{
          fontSize: "clamp(2.4rem, 6vw, 4rem)",
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: 24,
          background: "linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.5))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Launch your waitlist<br />in 60 seconds.
        </h1>

        <p style={{
          fontSize: 18,
          color: "rgba(232,232,240,0.55)",
          lineHeight: 1.75,
          marginBottom: 40,
          maxWidth: 520,
          margin: "0 auto 40px",
        }}>
          Create branded waitlist pages, collect signups with custom fields,
          get notified instantly, and gate access when you&apos;re ready — no code required.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/login" style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "white",
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 600,
            padding: "14px 28px",
            borderRadius: 10,
            letterSpacing: "-0.01em",
          }}>
            Start for free →
          </Link>
          <Link href="#how-it-works" style={{
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
            fontSize: 16,
            padding: "14px 28px",
            borderRadius: 10,
          }}>
            See how it works
          </Link>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 20 }}>
          Free plan · No credit card · 60-second setup
        </p>
      </section>

      {/* ── DEMO SCREENSHOT (placeholder UI) ─────────────────────────── */}
      <section style={{ padding: "0 24px 80px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          overflow: "hidden",
          padding: "32px",
        }}>
          {/* Mini dashboard mockup */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {["Dashboard", "Signups", "Settings"].map((tab, i) => (
              <div key={tab} style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: i === 0 ? "rgba(59,130,246,0.15)" : "transparent",
                border: `1px solid ${i === 0 ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)"}`,
                fontSize: 13,
                color: i === 0 ? "#60a5fa" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
              }}>{tab}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total signups", value: "2,847", delta: "+12% this week" },
              { label: "Active waitlists", value: "3", delta: "2 live, 1 draft" },
              { label: "Conversion rate", value: "68%", delta: "form → submit" },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: "16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 8 }}>{stat.label.toUpperCase()}</p>
                <p style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: "rgba(99,160,255,0.7)" }}>{stat.delta}</p>
              </div>
            ))}
          </div>

          <div style={{
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Recent signups</span>
              <span style={{ fontSize: 12, color: "#60a5fa", cursor: "pointer" }}>Export CSV</span>
            </div>
            {[
              { name: "Marcus T.", territory: "Austin, TX", role: "Founder", time: "2m ago" },
              { name: "Priya K.", territory: "London, UK", role: "Builder", time: "8m ago" },
              { name: "Jordan W.", territory: "Lagos, NG", role: "Ally", time: "14m ago" },
            ].map(row => (
              <div key={row.name} style={{
                padding: "12px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: 13,
              }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{row.name}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>{row.territory}</span>
                  <span style={{ color: "#8b5cf6", fontSize: 12 }}>{row.role}</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>{row.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "80px 24px", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "#60a5fa", fontWeight: 600, marginBottom: 16 }}>HOW IT WORKS</p>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 48 }}>
          Three steps to launch.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
          {[
            { step: "01", title: "Create your waitlist", desc: "Name it, write your headline, add the fields you want. Takes under a minute." },
            { step: "02", title: "Share the link", desc: "Get a clean URL at pregate.io/w/your-slug. Share it everywhere." },
            { step: "03", title: "Watch signups come in", desc: "Get notified by email for every signup. View and export from your dashboard." },
          ].map(s => (
            <div key={s.step} style={{
              padding: "28px 24px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
              textAlign: "left",
            }}>
              <p style={{ fontSize: 11, color: "#60a5fa", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 12 }}>{s.step}</p>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(232,232,240,0.5)", lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px 80px", maxWidth: 900, margin: "0 auto" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "#60a5fa", fontWeight: 600, textAlign: "center", marginBottom: 16 }}>FEATURES</p>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", marginBottom: 48 }}>
          Everything you need to gate your launch.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: "24px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(232,232,240,0.5)", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "60px 24px 100px", maxWidth: 960, margin: "0 auto" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "#60a5fa", fontWeight: 600, textAlign: "center", marginBottom: 16 }}>PRICING</p>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em", textAlign: "center", marginBottom: 16 }}>
          Simple, honest pricing.
        </h2>
        <p style={{ textAlign: "center", color: "rgba(232,232,240,0.5)", fontSize: 16, marginBottom: 48 }}>
          Start free. Upgrade when you grow.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {PRICING.map(plan => (
            <div key={plan.name} style={{
              padding: "32px 28px",
              borderRadius: 14,
              border: `1px solid ${plan.highlight ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
              background: plan.highlight ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
              position: "relative",
            }}>
              {plan.highlight && (
                <div style={{
                  position: "absolute",
                  top: -1, left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "0 0 8px 8px",
                  padding: "4px 14px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.08em",
                }}>MOST POPULAR</div>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{plan.name}</h3>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 36, fontWeight: 700 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 14, color: "rgba(232,232,240,0.5)", marginBottom: 24, lineHeight: 1.6 }}>{plan.desc}</p>
              <Link href={plan.href} style={{
                display: "block",
                textAlign: "center",
                padding: "12px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                marginBottom: 24,
                background: plan.highlight ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.06)",
                border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                color: "white",
              }}>{plan.cta}</Link>
              <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "rgba(232,232,240,0.65)" }}>
                    <span style={{ color: "#4ade80", flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────── */}
      <section style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "80px 24px",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 20 }}>
          Ready to gate your launch?
        </h2>
        <p style={{ fontSize: 16, color: "rgba(232,232,240,0.5)", marginBottom: 36 }}>
          Join builders using Pregate to capture demand before they ship.
        </p>
        <Link href="/auth/login" style={{
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          color: "white",
          textDecoration: "none",
          fontSize: 16,
          fontWeight: 600,
          padding: "14px 32px",
          borderRadius: 10,
        }}>Get started free — no credit card</Link>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", marginTop: 20 }}>
          Built by Mākoa · Honolulu, HI
        </p>
      </section>
    </div>
  );
}
