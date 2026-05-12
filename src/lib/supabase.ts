import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Client-side (uses anon key, respects RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Server-side (uses service key, bypasses RLS — use only in API routes)
export function supabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface Org {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: "free" | "lite" | "growth" | "pro";
  created_at: string;
}

export interface Waitlist {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  headline: string | null;
  description: string | null;
  logo_url: string | null;
  cta_text: string | null;
  success_message: string | null;
  fields: WaitlistField[];
  notify_email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface WaitlistField {
  key: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea";
  required: boolean;
  options?: string[]; // for select
}

export interface WaitlistSignup {
  id: string;
  waitlist_id: string;
  email: string;
  data: Record<string, string>;
  created_at: string;
}
