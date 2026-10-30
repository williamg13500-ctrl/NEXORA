CREATE INDEX IF NOT EXISTS idx_announcements_public_order ON announcements(is_pinned DESC, published_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_brand_source_time ON click_events(brand, source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_retention ON click_events(created_at);
CREATE TABLE IF NOT EXISTS click_event_limits (
 bucket_start TIMESTAMPTZ PRIMARY KEY,
 event_count INTEGER NOT NULL DEFAULT 0 CHECK (event_count >= 0)
);