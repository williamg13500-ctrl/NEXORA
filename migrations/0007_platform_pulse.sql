ALTER TABLE platform_checks ADD COLUMN IF NOT EXISTS http_status INTEGER;
ALTER TABLE platform_checks ADD COLUMN IF NOT EXISTS error TEXT;
CREATE INDEX IF NOT EXISTS idx_platform_checks_latest ON platform_checks(platform_id, checked_at DESC, id DESC);
CREATE TABLE IF NOT EXISTS platform_audit (
 id BIGSERIAL PRIMARY KEY,
 platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
 actor_id TEXT NOT NULL DEFAULT 'admin',
 change_summary TEXT NOT NULL DEFAULT '',
 old_values JSONB NOT NULL DEFAULT '{}'::jsonb,
 new_values JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_platform_audit_platform_time ON platform_audit(platform_id, created_at DESC);