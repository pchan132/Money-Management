-- Add subscriptions table for recurring monthly fixed costs
CREATE TABLE IF NOT EXISTS subscriptions (
  id           TEXT         PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id      TEXT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT         NOT NULL,
  amount       NUMERIC(14,2) NOT NULL,
  currency     TEXT         NOT NULL DEFAULT 'THB',
  amount_thb   NUMERIC(14,2) NOT NULL DEFAULT 0,
  billing_date INTEGER      NOT NULL DEFAULT 1,
  category_id  TEXT         REFERENCES categories(id) ON DELETE SET NULL,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  note         TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
