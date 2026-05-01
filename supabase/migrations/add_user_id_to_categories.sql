-- Migration: make categories user-scoped
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
--
-- If you ALREADY ran a previous version of this migration that used auth.users,
-- run the fix block below first:
--
--   ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
--   ALTER TABLE public.categories ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
--
-- Then run the rest of this file.
-- -------------------------------------------------------------------------

-- 1. Add user_id column (TEXT to match public.users.id which uses cuid)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES public.users (id) ON DELETE CASCADE;

-- 2. Delete any existing shared/seed categories that have no owner
--    (they are no longer valid in a user-scoped model)
DELETE FROM public.categories WHERE user_id IS NULL;

-- 3. Make user_id NOT NULL now that orphaned rows are removed
ALTER TABLE public.categories
  ALTER COLUMN user_id SET NOT NULL;

-- 4. Add index for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories (user_id);

-- 5. Drop the old open-access policy and add user-scoped policies
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;

CREATE POLICY "categories_select_own" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);
