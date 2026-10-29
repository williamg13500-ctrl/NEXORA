CREATE TABLE IF NOT EXISTS enquiry_audit (
  id BIGSERIAL PRIMARY KEY,
  enquiry_id BIGINT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL DEFAULT 'admin',
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  change_summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);