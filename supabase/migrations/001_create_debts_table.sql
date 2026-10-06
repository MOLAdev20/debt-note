-- Migration: bikin tabel `debts` + RLS policies
-- File: supabase/migrations/001_create_debts_table.sql
--
-- Cara pakai: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Aman dijalanin berkali-kali (idempotent).

-- =========================================================
-- 1. Enum tipe utang
-- =========================================================
DO $$
BEGIN
  CREATE TYPE public.debt_type AS ENUM ('owed_to_me', 'i_owe');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =========================================================
-- 2. Tabel debts
-- =========================================================
CREATE TABLE IF NOT EXISTS public.debts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type             public.debt_type NOT NULL,
  counterpart_name TEXT NOT NULL,
  amount           BIGINT NOT NULL CHECK (amount > 0),
  note             TEXT CHECK (note IS NULL OR char_length(note) <= 200),
  due_date         DATE,
  settled_at       TIMESTAMPTZ,          -- NULL = belum lunas
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index buat query yang selalu difilter/diurutkan per user.
CREATE INDEX IF NOT EXISTS idx_debts_user_id
  ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_created_at
  ON public.debts(user_id, created_at DESC);

-- =========================================================
-- 3. Trigger auto-update `updated_at`
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_debts_updated_at ON public.debts;
CREATE TRIGGER trigger_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 4. Row Level Security (WAJIB)
--    Tanpa ini, anon key bisa baca data user lain via REST API.
-- =========================================================
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- User cuma bisa lihat row miliknya sendiri.
DROP POLICY IF EXISTS "Users can view own debts" ON public.debts;
CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert cuma boleh kalau user_id-nya = user yang lagi login.
DROP POLICY IF EXISTS "Users can insert own debts" ON public.debts;
CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update cuma boleh row miliknya, dan gak boleh "dipindah" ke user lain.
DROP POLICY IF EXISTS "Users can update own debts" ON public.debts;
CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete cuma boleh row miliknya.
DROP POLICY IF EXISTS "Users can delete own debts" ON public.debts;
CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================
-- 5. Privileges
--    RLS yang nentuin row mana yang kebaca, bukan grant ini.
--    `anon` sengaja TIDAK dikasih akses apa-apa ke tabel ini.
-- =========================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO authenticated;
