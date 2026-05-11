"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Waitlist, WaitlistSignup } from "@/lib/supabase";
import Link from "next/link";

function WaitlistDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const justCreated = searchParams.get("created") === "1";

  const [waitlist, setWaitlist] = useState<Waitlist | null>(null);
  const [signups, setSignups] = useState<WaitlistSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/auth/login"); return; }

    const { data: wl } = await supabase
      .from("pg_waitlists")
      .select("*")
      .eq("id", id)
      .single();

    if (!wl) { router.replace("/dashboard"); return; }
    setWaitlist(wl);

    const { data: sups } = await supabase
      .from("pg_waitlist_signups")
      .select("*")
      .eq("waitlist_id", id)
      .order("created_at", { ascending: false });

    setSignups(sups ?? []);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  function copyLink() {
    if (!waitlist) return;
    navigator.clipboard.writeText(`https://pregate.io/w/${waitlist.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportCSV() {
    if (!waitlist || !signups.length) return;
    const fields = waitlist.fields.map(f => f.key);
    const headers = ["created_at", "email", ...fields.filter(k => k !== "email")];
    const rows = signups.map(s => [
      s.created_at,
      s.email,
      ...fields.filter(k => k !== "email").map(k => s.data[k] ?? ""),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${waitlist.slug}-signups.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function toggleActive() {
    if (!waitlist) return;
    setToggling(true);
    const { data } = await supabase
      .from("pg_waitlists")
      .update({ is_active: !waitlist.is_active })
      .eq("id", id)
      .select()
      .single();
    if (data) setWaitlist(data);
    setToggling(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (!waitlist) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Inter, system-ui, sans-serif", color: "#e8e8f0" }}>
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13 }}>← Dashboard</Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{waitlist.name}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={toggleActive}
            disabled={toggling}
            style={{
              fontSize: 12, padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
              background: waitlist.is_active ? "rgba(239,68,68,0.12)" : "rgba(74,222,128,0.12)",
              border: `1px solid ${waitlist.is_active ? "rgba(239,68,68,0.3)" : "rgba(74,222,128,0.3)"}`,
              color: waitlist.is_active ? "#f87171" : "#4ade80",
            }}
          >{toggling ? "..." : waitlist.is_active ? "Pause waitlist" : "Activate"}</button>
          <a
            href={`/w/${waitlist.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12, padding: "7px 14px", borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)", textDecoration: "none",
            }}
          >View page ↗</a>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>
        {justCreated && (
          <div style={{
            padding: "16px 20px",
            borderRadius: 10,
            border: "1px solid rgba(74,222,128,0.3)",
            background: "rgba(74,222,128,0.08)",
            marginBottom: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <p style={{ fontSize: 14, color: "#4ade80", fontWeight: 500 }}>
              🎉 Waitlist created! Your page is live.
            </p>
            <a href={`/w/${waitlist.slug}`} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "#4ade80", textDecoration: "none" }}>
              Visit it →
            </a>
          </div>
        )}

        {/* Share link */}
        <div style={{
          padding: "20px",
          borderRadius: 10,
          border: "1px solid rgba(99,102,241,0.2)",
          background: "rgba(99,102,241,0.06)",
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap" as const,
        }}>
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 4 }}>SHARE YOUR WAITLIST</p>
            <p style={{ fontSize: 15, fontFamily: "JetBrains Mono, monospace", color: "#a78bfa" }}>
              pregate.io/w/{waitlist.slug}
            </p>
          </div>
          <button
            onClick={copyLink}
            style={{
              fontSize: 13, padding: "9px 18px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
              background: copied ? "rgba(74,222,128,0.15)" : "rgba(99,102,241,0.15)",
              border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(99,102,241,0.3)"}`,
              color: copied ? "#4ade80" : "#a78bfa",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >{copied ? "✓ Copied!" : "Copy link"}</button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total signups", value: signups.length },
            { label: "This week", value: signups.filter(s => new Date(s.created_at) > new Date(Date.now() - 7 * 864e5)).length },
            { label: "Today", value: signups.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: "18px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: 8 }}>{stat.label.toUpperCase()}</p>
              <p style={{ fontSize: 26, fontWeight: 700 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Signups table */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Signups ({signups.length})</h2>
          {signups.length > 0 && (
            <button
              onClick={exportCSV}
              style={{
                fontSize: 12, padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              }}
            >Export CSV ↓</button>
          )}
        </div>

        {signups.length === 0 ? (
          <div style={{
            padding: "48px",
            borderRadius: 10,
            border: "1px dashed rgba(255,255,255,0.08)",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 24, marginBottom: 12 }}>📭</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
              No signups yet. Share your link to start collecting.
            </p>
          </div>
        ) : (
          <div style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.07)",
            overflow: "hidden",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.05em",
              fontWeight: 600,
            }}>
              <span>EMAIL</span>
              <span>DATA</span>
              <span>SIGNED UP</span>
            </div>
            {signups.map(signup => (
              <div key={signup.id} style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr",
                padding: "13px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: 13,
                alignItems: "center",
              }}>
                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{signup.email}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                  {Object.entries(signup.data ?? {})
                    .filter(([k]) => k !== "email")
                    .map(([, v]) => v)
                    .join(", ") || "—"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                  {new Date(signup.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function WaitlistDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter, system-ui", fontSize: 14 }}>Loading...</p>
      </div>
    }>
      <WaitlistDetailContent />
    </Suspense>
  );
}
