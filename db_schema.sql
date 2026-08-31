-- ================================================================
-- NFC Smart Profile — Neon PostgreSQL Schema
-- Use this script to set up your Neon PostgreSQL database.
-- ================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── users (Custom Auth Table) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── user_roles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  role    TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin'))
);

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username     TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  bio          TEXT,
  avatar_url   TEXT,
  template     TEXT NOT NULL DEFAULT 'linktree' CHECK (template IN ('linktree','personal','company','cv','portfolio')),
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
  owner_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  profile_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive','active','suspended')),
  activated_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── card_actions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS card_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL UNIQUE,
  action_type     TEXT NOT NULL CHECK (action_type IN ('profile','instagram','whatsapp','website','tiktok','youtube','linkedin','custom')),
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
  card_id    UUID REFERENCES cards(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('tap','profile_view','link_click')),
  destination TEXT,
  user_agent  TEXT,
  ip_hash     TEXT,
  referrer    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email         ON users (email);
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

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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
