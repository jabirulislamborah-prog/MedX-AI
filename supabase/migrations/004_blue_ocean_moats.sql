-- ============================================================
-- MedX AI — Blue Ocean Moats Database Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. ADD NEW COLUMNS TO PROFILES
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS exam_target TEXT,             -- 'USMLE Step 1', 'PLAB 1', 'NEET-PG', etc.
  ADD COLUMN IF NOT EXISTS study_year TEXT,              -- 'Pre-clinical', 'Clinical', 'IMG', etc.
  ADD COLUMN IF NOT EXISTS study_goal TEXT,              -- 'pass', 'competitive', 'retake'
  ADD COLUMN IF NOT EXISTS exam_date DATE,               -- target exam date
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS streak_frozen BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS squad_id UUID;               -- foreign key to squads

-- 2. CREATE SQUADS TABLE
CREATE TABLE IF NOT EXISTS squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADD FOREIGN KEY FOR squad_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_squad_id') THEN
    ALTER TABLE profiles
      ADD CONSTRAINT fk_profiles_squad_id
      FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. ENABLE RLS ON SQUADS
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read squads"
  ON squads FOR SELECT USING (true);

CREATE POLICY "Users can create squads"
  ON squads FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 5. RPC: INCREMENT XP (for streak bonuses)
DROP FUNCTION IF EXISTS increment_xp(UUID, INTEGER);
CREATE OR REPLACE FUNCTION increment_xp(uid UUID, amount INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles
  SET xp = xp + amount,
      weekly_xp = weekly_xp + amount
  WHERE id = uid;
END;
$$;

-- 6. FUNCTION: Reset weekly_xp every Sunday (call via cron)
CREATE OR REPLACE FUNCTION reset_weekly_xp()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET weekly_xp = 0;
END;
$$;

-- 7. INDEX for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_squad_id ON profiles(squad_id);
CREATE INDEX IF NOT EXISTS idx_profiles_weekly_xp ON profiles(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_squads_invite_code ON squads(invite_code);
