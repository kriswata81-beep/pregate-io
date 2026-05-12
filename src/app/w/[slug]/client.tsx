"use client";
import { useState, useEffect } from "react";
import type { Waitlist, WaitlistField } from "@/lib/supabase";
import Link from "next/link";

interface Props {
  waitlist: Waitlist;
  signupCount: number;
}

export default function PublicWaitlistClient({ waitlist, signupCount }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [refBy, setRefBy] = useState("");
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(signupCount);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRefBy(params.get("ref") ?? "");
  }, []);

  const emailField = waitlist.fields.find((f: WaitlistField) => f.type === "email") ?? { key: "email", label: "Email", type: "email" as const, required: true };
  const email = formData[emailField.key] ?? "";

  function setValue(key: string, value: string) {
    setFormData(d => ({ ...d, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waitlist_id: waitlist.id, email: email.trim(), data: formData, referred_by: refBy || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to join");
      setReferralCode(json.referral_code ?? "");
      setCount(c => c + 1);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const shareUrl = referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : "https://pregate.io"}/w/${waitlist.slug}?ref=${referralCode}`
    : `${typeof window !== "undefined" ? window.location.origin : "https://pregate.io"}/w/${waitlist.slug}`;

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, padding: "13px 16px", color: "white", fontSize: 15, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Inter, system-ui, sans-serif", color: "#e8e8f0", display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px 80px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {waitlist.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={waitlist.logo_url} alt="" style={{ height: 48, marginBottom: 32, objectFit: "contain" }} />
        )}

        {!done ? (
          <>
            <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 12 }}>
              {waitlist.headline ?? waitlist.name}
            </h1>

            {/* Social proof count */}
            {count > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ display: "flex" }}>
                  {[...Array(Math.min(count, 5))].map((_, i) => (
                    <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: `hsl(${i * 47 + 220}, 70%, 55%)`, border: "2px solid #0a0a0f", marginLeft: i > 0 ? -8 : 0, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: "rgba(232,232,240,0.5)" }}>
                  <strong style={{ color: "#e8e8f0" }}>{count.toLocaleString()}</strong> {count === 1 ? "person" : "people"} already waiting
                </span>
              </div>
            )}

            {waitlist.description && (
              <p style={{ fontSize: 16, color: "rgba(232,232,240,0.55)", lineHeight: 1.75, marginBottom: 32 }}>{waitlist.description}</p>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
                {waitlist.fields.map((field: WaitlistField) => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6, letterSpacing: "0.04em" }}>
                      {field.label}{field.required && " *"}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder={field.label} value={formData[field.key] ?? ""} required={field.required} onChange={e => setValue(field.key, e.target.value)} />
                    ) : field.type === "select" && field.options ? (
                      <select style={{ ...inputStyle, cursor: "pointer" }} value={formData[field.key] ?? ""} required={field.required} onChange={e => setValue(field.key, e.target.value)}>
                        <option value="">Select {field.label}</option>
                        {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} style={inputStyle} placeholder={field.label} value={formData[field.key] ?? ""} required={field.required} onChange={e => setValue(field.key, e.target.value)}
                        onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 14 }}>{error}</p>}

              <button type="submit" disabled={submitting || !email.trim()} style={{ width: "100%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", border: "none", borderRadius: 10, padding: "15px", fontSize: 16, fontWeight: 600, cursor: submitting || !email.trim() ? "not-allowed" : "pointer", opacity: submitting || !email.trim() ? 0.6 : 1, fontFamily: "inherit", letterSpacing: "-0.01em", transition: "opacity 0.2s" }}>
                {submitting ? "Joining..." : waitlist.cta_text ?? "Join the waitlist →"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 28 }}>
              Powered by{" "}
              <Link href="https://pregate.io" style={{ color: "rgba(99,162,255,0.5)", textDecoration: "none", fontWeight: 600 }}>Pregate</Link>
              {" "}· <Link href="https://pregate.io" style={{ color: "rgba(99,162,255,0.35)", textDecoration: "none" }}>Build your free waitlist →</Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>You&apos;re on the list!</h2>
            <p style={{ fontSize: 16, color: "rgba(232,232,240,0.55)", lineHeight: 1.75, maxWidth: 360, margin: "0 auto 32px" }}>
              {waitlist.success_message ?? "We'll be in touch when we're ready for you."}
            </p>

            {/* Viral share section */}
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "24px", marginBottom: 24, textAlign: "left" }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, textAlign: "center" }}>🚀 Move up the list</p>
              <p style={{ fontSize: 13, color: "rgba(232,232,240,0.5)", textAlign: "center", marginBottom: 16 }}>Share your link. Every person you refer moves you up.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                  {shareUrl}
                </div>
                <button onClick={copyLink} style={{ background: copied ? "rgba(74,222,128,0.2)" : "rgba(99,102,241,0.3)", border: "1px solid rgba(99,102,241,0.4)", color: copied ? "#4ade80" : "#a78bfa", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  {copied ? "Copied! ✓" : "Copy link"}
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just joined the ${waitlist.name} waitlist! Get early access → ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#60a5fa", textDecoration: "none", padding: "6px 14px", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 6 }}>Share on X</a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#818cf8", textDecoration: "none", padding: "6px 14px", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 6 }}>Share on LinkedIn</a>
              </div>
            </div>

            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
              Powered by{" "}
              <Link href="https://pregate.io" style={{ color: "rgba(99,162,255,0.5)", textDecoration: "none", fontWeight: 600 }}>Pregate</Link>
              {" "}· <Link href="https://pregate.io" style={{ color: "rgba(99,162,255,0.35)", textDecoration: "none" }}>Build your free waitlist →</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}