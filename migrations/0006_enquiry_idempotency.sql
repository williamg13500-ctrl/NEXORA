ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS enquiries_idempotency_key_unique ON enquiries(idempotency_key) WHERE idempotency_key IS NOT NULL;