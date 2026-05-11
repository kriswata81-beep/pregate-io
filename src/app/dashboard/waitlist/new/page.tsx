"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { WaitlistField } from "@/lib/supabase";
import Link from "next/link";

const DEFAULT_FIELDS: WaitlistField[] = [
  { key: "name", label: "Full name", type: "text", required: true },
  { key: "email", label: "Email address", type: "email", required: true },
];

export default function NewWaitlistPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    headline: "",
    description: "",
    cta_text: "Join the waitlist",
    success_message: "You're on the list! We'll be in touch.",
    notify_email: "",
  });
  const [fields, setFields] = useState<WaitlistField[]>(DEFAULT_FIELDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/auth/login"); return; }
      const { data: org } = await supabase
        .from("pg_orgs")
        .select("id")
        .eq("owner_id", session.user.id)
        .single();
      if (org) setOrgId(org.id);
    });
  }, [router]);

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: slugify(name) }));
  }

  function addField() {
    const key = `field_${fields.length}`;
    setFields(f => [...f, { key, label: "", type: "text", required: false }]);
  }

  function removeField(idx: number) {
    setFields(f => f.filter((_, i) => i !== idx));
  }

  function updateField(idx: number, patch: Partial<WaitlistField>) {
    setFields(f => f.map((field, i) => i === idx ? { ...field, ...patch } : field));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) { setError("Organization not found. Please refresh."); return; }
    if (!form.name.trim() || !form.slug.trim()) { setError("Name and slug are required."); return; }

    setSubmitting(true);
    setError("");

    const { data, error: dbError } = await supabase
      .from("pg_waitlists")
      .insert({
        org_id: orgId,
        name: form.name.trim(),
        slug: form.slug.trim(),
        headline: form.headline.trim() || null,
        description: form.description.trim() || null,
        cta_text: form.cta_text.trim(),
        success_message: form.success_message.trim(),
        notify_email: form.notify_email.trim() || null,
        fields,
        is_active: true,
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message.includes("unique") ? "That URL slug is already taken. Try another." : dbError.message);
      setSubmitting(false);
      return;
    }

    router.replace(`/dashboard/waitlist/${data.id}?created=1`);
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "11px 14px",
    color: "white",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 6,
    letterSpacing: "0.04em",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Inter, system-ui, sans-serif", color: "#e8e8f0" }}>
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13 }}>← Dashboard</Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>New waitlist</span>
      </nav>

      <main style={{ maxWidth: 620, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32, letterSpacing: "-0.02em" }}>
          Create a new waitlist
        </h1>

        <form onSubmit={handleCreate}>
          {/* Basic info */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 16, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
              Basic info
            </h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={labelStyle}>Waitlist name *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Makoa Founders Circle"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>URL slug *</label>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <span style={{
                    fontSize: 13, color: "rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRight: "none",
                    borderRadius: "8px 0 0 8px",
                    padding: "11px 12px",
                    whiteSpace: "nowrap" as const,
                  }}>pregate.io/w/</span>
                  <input
                    style={{ ...inputStyle, borderRadius: "0 8px 8px 0" }}
                    placeholder="your-slug"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Headline (shown on page)</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Join the founding circle — before it closes."
                  value={form.headline}
                  onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical" as const, minHeight: 80 }}
                  placeholder="Tell people what they're signing up for..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </section>

          {/* CTA & messaging */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 16, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
              Button & messaging
            </h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={labelStyle}>CTA button text</label>
                <input
                  style={inputStyle}
                  value={form.cta_text}
                  onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))}
                />
              </div>
              <div>
                <label style={labelStyle}>Success message (shown after signup)</label>
                <input
                  style={inputStyle}
                  value={form.success_message}
                  onChange={e => setForm(f => ({ ...f, success_message: e.target.value }))}
                />
              </div>
              <div>
                <label style={labelStyle}>Notify email (you get an email per signup)</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="your@email.com"
                  value={form.notify_email}
                  onChange={e => setForm(f => ({ ...f, notify_email: e.target.value }))}
                />
              </div>
            </div>
          </section>

          {/* Form fields */}
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
                Form fields
              </h2>
              <button
                type="button"
                onClick={addField}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(99,102,241,0.3)",
                  color: "#a78bfa",
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >+ Add field</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {fields.map((field, idx) => (
                <div key={idx} style={{
                  padding: "16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <label style={labelStyle}>Label</label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. Full name"
                        value={field.label}
                        onChange={e => updateField(idx, { label: e.target.value, key: slugify(e.target.value) || field.key })}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Type</label>
                      <select
                        style={{ ...inputStyle, cursor: "pointer" }}
                        value={field.type}
                        onChange={e => updateField(idx, { type: e.target.value as WaitlistField["type"] })}
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="textarea">Long text</option>
                        <option value="select">Select</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      disabled={field.key === "email"} // can't remove email
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,100,100,0.5)",
                        borderRadius: 6,
                        padding: "11px 12px",
                        cursor: field.key === "email" ? "not-allowed" : "pointer",
                        opacity: field.key === "email" ? 0.3 : 1,
                        fontFamily: "inherit",
                        fontSize: 14,
                      }}
                    >✕</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                    <input
                      type="checkbox"
                      id={`req-${idx}`}
                      checked={field.required}
                      onChange={e => updateField(idx, { required: e.target.checked })}
                    />
                    <label htmlFor={`req-${idx}`} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                      Required
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !form.name.trim()}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "14px",
              fontSize: 15,
              fontWeight: 600,
              cursor: submitting || !form.name.trim() ? "not-allowed" : "pointer",
              opacity: submitting || !form.name.trim() ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            {submitting ? "Creating..." : "Create waitlist →"}
          </button>
        </form>
      </main>
    </div>
  );
}
