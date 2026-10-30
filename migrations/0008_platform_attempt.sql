ALTER TABLE platforms ADD COLUMN IF NOT EXISTS last_check_attempt_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_platform_checks_attempt_throttle ON platforms(id, last_check_attempt_at);