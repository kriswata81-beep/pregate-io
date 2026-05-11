-- ── Pregate.io multi-tenant schema ──────────────────────────────────────────
-- Run this in your Supabase SQL editor
-- Tables are prefixed with pg_ to avoid conflicts with existing Makoa tables

-- ── 1. Orgs (one per customer) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pg_orgs (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id              uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name                  text NOT NULL DEFAULT 'My Organization',
  slug                  text UNIQUE NOT NULL,
  stripe_customer_id    text,
  stripe_subscription_id text,
  plan                  text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro')),
  created_at            timestamptz DEFAULT now()
);

-- ── 2. Waitlists (each org can have many) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS pg_waitlists (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id           uuid REFERENCES pg_orgs(id) ON DELETE CASCADE NOT NULL,
  name             text NOT NULL,
  slug             text NOT NULL,
  headline         text,
  description      text,
  logo_url         text,
  cta_text         text DEFAULT 'Join the waitlist',
  success_message  text DEFAULT 'You''re on the list! We''ll be in touch.',
  fields           jsonb DEFAULT '[{"key":"name","label":"Full name","type":"text","required":true},{"key":"email","label":"Email address","type":"email","required":true}]'::jsonb,
  notify_email     text,
  is_active        boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  UNIQUE(org_id, slug)
);

-- Global slug uniqueness for public URLs (pregate.io/w/slug)
CREATE UNIQUE INDEX IF NOT EXISTS pg_waitlists_global_slug ON pg_waitlists(slug);

-- ── 3. Signups (one per email per waitlist) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS pg_waitlist_signups (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  waitlist_id  uuid REFERENCES pg_waitlists(id) ON DELETE CASCADE NOT NULL,
  email        text NOT NULL,
  data         jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(waitlist_id, email)
);

-- ── RLS Policies ─────────────────────────────────────────────────────────────

ALTER TABLE pg_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pg_waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pg_waitlist_signups ENABLE ROW LEVEL SECURITY;

-- pg_orgs: owner can CRUD their own org
CREATE POLICY "org_owner_all" ON pg_orgs
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- pg_waitlists: org owner can CRUD their waitlists
CREATE POLICY "waitlist_owner_all" ON pg_waitlists
  FOR ALL TO authenticated
  USING (
    org_id IN (SELECT id FROM pg_orgs WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    org_id IN (SELECT id FROM pg_orgs WHERE owner_id = auth.uid())
  );

-- pg_waitlists: anyone can SELECT active waitlists (for public signup pages)
CREATE POLICY "waitlist_public_read" ON pg_waitlists
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- pg_waitlist_signups: org owner can read their signups
CREATE POLICY "signup_owner_read" ON pg_waitlist_signups
  FOR SELECT TO authenticated
  USING (
    waitlist_id IN (
      SELECT wl.id FROM pg_waitlists wl
      JOIN pg_orgs o ON o.id = wl.org_id
      WHERE o.owner_id = auth.uid()
    )
  );

-- pg_waitlist_signups: anyone can INSERT (public signups) — via service role API
-- Signups are inserted server-side via service key, so anon INSERT not needed

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS pg_waitlist_signups_waitlist_id ON pg_waitlist_signups(waitlist_id);
CREATE INDEX IF NOT EXISTS pg_waitlist_signups_created_at ON pg_waitlist_signups(created_at DESC);
CREATE INDEX IF NOT EXISTS pg_waitlists_org_id ON pg_waitlists(org_id);
CREATE INDEX IF NOT EXISTS pg_orgs_owner_id ON pg_orgs(owner_id);
