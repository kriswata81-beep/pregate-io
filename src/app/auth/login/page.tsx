"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 48 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "white",
        }}>P</div>
        <span style={{ fontWeight: 700, fontSize: 18, color: "white", letterSpacing: "-0.02em" }}>Pregate</span>
      </Link>

      <div style={{
        width: "100%",
        maxWidth: 400,
        padding: "40px 32px",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}>
        {!sent ? (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8, letterSpacing: "-0.02em" }}>
              Sign in to Pregate
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32, lineHeight: 1.6 }}>
              We&apos;ll send you a magic link. No password needed.
            </p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    color: "white",
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>

              {error && (
                <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "13px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !email.trim() ? 0.6 : 1,
                  fontFamily: "inherit",
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? "Sending..." : "Send magic link →"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.25)", marginTop: 24 }}>
              By continuing, you agree to our{" "}
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Terms of Service</span>
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 12, letterSpacing: "-0.02em" }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>
              We sent a magic link to<br />
              <span style={{ color: "white", fontWeight: 600 }}>{email}</span><br />
              Click it to sign in — no password needed.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              style={{
                marginTop: 32,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                borderRadius: 8,
                padding: "10px 20px",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
