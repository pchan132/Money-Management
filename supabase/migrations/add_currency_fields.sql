-- Migration: add multi-currency support to transactions
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS currency      TEXT    NOT NULL DEFAULT 'THB',
  ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10, 4),
  ADD COLUMN IF NOT EXISTS amount_thb    NUMERIC(14, 2) NOT NULL DEFAULT 0;

-- Back-fill existing rows: they were all in THB so amount_thb = amount
UPDATE transactions
SET amount_thb = amount
WHERE amount_thb = 0;

-- Add a check constraint so only supported currencies are stored
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_currency_check;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_currency_check
  CHECK (currency IN ('THB', 'USD'));
