import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function supabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// ── Plan metadata ────────────────────────────────────────────────────────────
export type Plan = "free" | "lite" | "growth" | "pro";

export interface PlanMeta {
  name: string;
  price: number;        // monthly USD
  signupsPerMonth: number; // -1 = unlimited
  maxWaitlists: number;    // -1 = unlimited
  gamified: boolean;
  customBranding: boolean;
  api: boolean;
  label: string;
}

export const PLANS: Record<Plan, PlanMeta> = {
  free: {
    name: "Free",
    price: 0,
    signupsPerMonth: 50,
    maxWaitlists: 1,
    gamified: false,
    customBranding: false,
    api: false,
    label: "Free forever",
  },
  lite: {
    name: "Lite",
    price: 9,
    signupsPerMonth: 250,
    maxWaitlists: 3,
    gamified: true,
    customBranding: false,
    api: false,
    label: "$9/mo",
  },
  growth: {
    name: "Growth",
    price: 29,
    signupsPerMonth: 1000,
    maxWaitlists: 5,
    gamified: true,
    customBranding: true,
    api: false,
    label: "$29/mo",
  },
  pro: {
    name: "Pro",
    price: 79,
    signupsPerMonth: -1,
    maxWaitlists: -1,
    gamified: true,
    customBranding: true,
    api: true,
    label: "$79/mo",
  },
};

// ── Types ────────────────────────────────────────────────────────────────────

export interface Org {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  affiliate_code: string | null;
  referred_by_affiliate: string | null;
  affiliate_earnings_cents: number;
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
  options?: string[];
}

export interface WaitlistSignup {
  id: string;
  waitlist_id: string;
  email: string;
  data: Record<string, string>;
  referral_code: string | null;
  referred_by: string | null;
  position: number;
  referral_count: number;
  created_at: string;
}
