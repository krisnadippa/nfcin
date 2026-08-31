-- ================================================================
-- NFC Smart Profile — Initial Schema
-- Run this in your Supabase SQL Editor or via supabase db push
-- ================================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username     TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  bio          TEXT,
  avatar_url   TEXT,
  template     TEXT NOT NULL DEFAULT 'linktree'
               CHECK (template IN ('linktree','personal','company','cv','portfolio')),
  profession   TEXT,
  company_name TEXT,
  industry     TEXT,
  location     TEXT,
  website_url  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── cards ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_code    TEXT UNIQUE NOT NULL,
  owner_id     UUID REFERENCES auth.users(id),
  profile_id   UUID REFERENCES profiles(id),
  status       TEXT NOT NULL DEFAULT 'inactive'
               CHECK (status IN ('inactive','active','suspended')),
  activated_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── card_actions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS card_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  action_type     TEXT NOT NULL
                  CHECK (action_type IN ('profile','instagram','whatsapp','website','tiktok','youtube','linkedin','custom')),
  destination_url TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── profile_links ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profile_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  icon        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── analytics_events ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id    UUID REFERENCES cards(id),
  profile_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL
             CHECK (event_type IN ('tap','profile_view','link_click')),
  destination TEXT,
  user_agent  TEXT,
  ip_hash     TEXT,
  referrer    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── user_roles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role    TEXT NOT NULL DEFAULT 'customer'
          CHECK (role IN ('customer','admin'))
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cards_card_code    ON cards (card_code);
CREATE INDEX IF NOT EXISTS idx_cards_owner_id     ON cards (owner_id);
CREATE INDEX IF NOT EXISTS idx_cards_status       ON cards (status);
CREATE INDEX IF NOT EXISTS idx_profiles_username  ON profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id   ON profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_card_actions_card  ON card_actions (card_id);
CREATE INDEX IF NOT EXISTS idx_profile_links_prof ON profile_links (profile_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_analytics_card     ON analytics_events (card_id);
CREATE INDEX IF NOT EXISTS idx_analytics_profile  ON analytics_events (profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created  ON analytics_events (created_at DESC);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_card_actions_updated_at
  BEFORE UPDATE ON card_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_profile_links_updated_at
  BEFORE UPDATE ON profile_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards             ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_actions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles        ENABLE ROW LEVEL SECURITY;

-- ── profiles RLS ──────────────────────────────────────────────
-- Public read (needed for /p/[username] pages)
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT USING (TRUE);

-- Only owner can modify their profile
CREATE POLICY "profiles_owner_insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_owner_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── cards RLS ─────────────────────────────────────────────────
-- Owner can read their own cards
CREATE POLICY "cards_owner_read"
  ON cards FOR SELECT
  USING (auth.uid() = owner_id);

-- Activation: allow reading unowned card to check status (for activation flow)
CREATE POLICY "cards_activation_read"
  ON cards FOR SELECT
  USING (owner_id IS NULL OR status = 'inactive');

-- Admin read (via user_roles check)
CREATE POLICY "cards_admin_read"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Owner can update their own card actions/profile link
CREATE POLICY "cards_owner_update"
  ON cards FOR UPDATE
  USING (auth.uid() = owner_id);

-- ── card_actions RLS ──────────────────────────────────────────
-- Card owner can read their card actions
CREATE POLICY "card_actions_owner_read"
  ON card_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cards
      WHERE cards.id = card_actions.card_id
        AND cards.owner_id = auth.uid()
    )
  );

-- Public read needed for /go/[cardCode] redirect (service role handles this)
-- Card owner can insert/update/delete
CREATE POLICY "card_actions_owner_write"
  ON card_actions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cards
      WHERE cards.id = card_actions.card_id
        AND cards.owner_id = auth.uid()
    )
  );

-- ── profile_links RLS ─────────────────────────────────────────
-- Public read (for /p/[username])
CREATE POLICY "profile_links_public_read"
  ON profile_links FOR SELECT USING (TRUE);

-- Owner can manage their profile links
CREATE POLICY "profile_links_owner_write"
  ON profile_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_links.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ── analytics_events RLS ──────────────────────────────────────
-- Owner can read their own analytics
CREATE POLICY "analytics_owner_read"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cards
      WHERE cards.id = analytics_events.card_id
        AND cards.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = analytics_events.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Insert is allowed (from service role in /go/ route)
-- No direct client insert policy needed (use service role)

-- ── user_roles RLS ────────────────────────────────────────────
-- Users can read their own role
CREATE POLICY "user_roles_self_read"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Only admin can manage roles (handled via service role)
