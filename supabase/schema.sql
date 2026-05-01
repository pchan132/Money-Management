-- ============================================================
-- Money Manager — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. CATEGORIES (user-scoped)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  icon       TEXT        NOT NULL DEFAULT '📦',
  color      TEXT        NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories (user_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 2. TRANSACTIONS (user-scoped)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID    NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type        TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
  amount      NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  category_id UUID    REFERENCES public.categories (id) ON DELETE SET NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id    ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type       ON public.transactions (user_id, type);

-- ──────────────────────────────────────────────────────────────
-- 3. Row Level Security — transactions
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "transactions_delete_own" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);
