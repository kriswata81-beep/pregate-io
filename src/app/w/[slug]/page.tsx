import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import PublicWaitlistClient from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: wl } = await supabase
    .from("pg_waitlists")
    .select("name, headline, description")
    .eq("slug", slug)
    .single();

  if (!wl) return { title: "Waitlist not found" };

  return {
    title: wl.name,
    description: wl.headline ?? wl.description ?? `Join the ${wl.name} waitlist`,
  };
}

export default async function PublicWaitlistPage({ params }: Props) {
  const { slug } = await params;
  const { data: wl } = await supabase
    .from("pg_waitlists")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!wl) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "rgba(255,255,255,0.5)",
        flexDirection: "column",
        gap: 12,
      }}>
        <p style={{ fontSize: 32 }}>🚫</p>
        <p style={{ fontSize: 16 }}>This waitlist doesn&apos;t exist or isn&apos;t active.</p>
        <a href="https://pregate.io" style={{ fontSize: 13, color: "rgba(99,162,255,0.7)", textDecoration: "none" }}>
          Create your own with Pregate →
        </a>
      </div>
    );
  }

  return <PublicWaitlistClient waitlist={wl} />;
}
