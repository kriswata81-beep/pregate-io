"use client";
import { useState } from "react";
import type { Waitlist, WaitlistField } from "@/lib/supabase";
import Link from "next/link";

interface Props {
  waitlist: Waitlist;
}

export default function PublicWaitlistClient({ waitlist }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const emailField = waitlist.fields.find(f => f.type === "email") ?? { key: "email", label: "Email", type: "email" as const, required: true };
  const email = formData[emailField.key] ?? "";

  function setValue(key: string, value: string) {
    setFormData(d => ({ ...d, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlist_id: waitlist.id,
          email: email.trim(),
          data: formData,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to join");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: "13px 16px",
    color: "white",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "Inter, system-ui, sans-serif",
      color: "#e8e8f0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 24px 80px",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo / branding */}
        {waitlist.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={waitlist.logo_url} alt="" style={{ height: 48, marginBottom: 32, objectFit: "contain" }} />
        )}

        {!done ? (
          <>
            {/* Headline */}
            {waitlist.headline && (
              <h1 style={{
                fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                marginBottom: 16,
              }}>{waitlist.headline}</h1>
            )}
            {!waitlist.headline && (
              <h1 style={{
                fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                marginBottom: 16,
              }}>{waitlist.name}</h1>
            )}

            {waitlist.description && (
              <p style={{
                fontSize: 16,
                color: "rgba(232,232,240,0.55)",
                lineHeight: 1.75,
                marginBottom: 36,
              }}>{waitlist.description}</p>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
                {waitlist.fields.map((field: WaitlistField) => (
                  <div key={field.key}>
                    <label style={{
                      display: "block",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.45)",
                      marginBottom: 6,
                      letterSpacing: "0.04em",
                    }}>
                      {field.label}{field.required && " *"}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                        placeholder={field.label}
                        value={formData[field.key] ?? ""}
                        required={field.required}
                        onChange={e => setValue(field.key, e.target.value)}
                      />
                    ) : field.type === "select" && field.options ? (
                      <select
                        style={{ ...inputStyle, cursor: "pointer" }}
                        value={formData[field.key] ?? ""}
                        required={field.required}
                        onChange={e => setValue(field.key, e.target.value)}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        style={inputStyle}
                        placeholder={field.label}
                        value={formData[field.key] ?? ""}
                        required={field.required}
                        onChange={e => setValue(field.key, e.target.value)}
                        onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <p style={{ color: "#f87171", fontSize: 13, marginBottom: 14 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !email.trim()}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  padding: "15px",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: submitting || !email.trim() ? "not-allowed" : "pointer",
                  opacity: submitting || !email.trim() ? 0.6 : 1,
                  fontFamily: "inherit",
                  letterSpacing: "-0.01em",
                  transition: "opacity 0.2s",
                }}
              >
                {submitting ? "Joining..." : waitlist.cta_text ?? "Join the waitlist →"}
              </button>
            </form>

            {/* Powered by */}
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.18)", marginTop: 28 }}>
              Powered by{" "}
              <Link href="https://pregate.io" style={{ color: "rgba(99,162,255,0.4)", textDecoration: "none" }}>
                Pregate
              </Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 24 }}>🎉</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>
              You&apos;re on the list!
            </h2>
            <p style={{ fontSize: 16, color: "rgba(232,232,240,0.55)", lineHeight: 1.75, maxWidth: 360, margin: "0 auto 32px" }}>
              {waitlist.success_message ?? "We'll be in touch when we're ready for you."}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
              Powered by{" "}
              <Link href="https://pregate.io" style={{ color: "rgba(99,162,255,0.4)", textDecoration: "none" }}>
                Pregate
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
