-- ============================================================
-- Money Manager — Seed data
-- Run AFTER schema.sql
-- ============================================================

INSERT INTO public.categories (name, icon, color) VALUES
  ('Food & Dining',    '🍔', '#f97316'),
  ('Transportation',   '🚗', '#3b82f6'),
  ('Housing',          '🏠', '#8b5cf6'),
  ('Healthcare',       '💊', '#ef4444'),
  ('Entertainment',    '🎮', '#ec4899'),
  ('Shopping',         '🛒', '#f59e0b'),
  ('Education',        '📚', '#14b8a6'),
  ('Travel',           '✈️', '#06b6d4'),
  ('Salary',           '💼', '#10b981'),
  ('Investment',       '📈', '#6366f1'),
  ('Bills & Utilities','💡', '#78716c'),
  ('Gifts',            '🎁', '#a855f7'),
  ('Subscriptions',    '📱', '#64748b'),
  ('Other',            '📦', '#9ca3af')
ON CONFLICT DO NOTHING;
