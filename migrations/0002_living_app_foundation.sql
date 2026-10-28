CREATE TABLE IF NOT EXISTS enquiries (
 id BIGSERIAL PRIMARY KEY,
 reference_code TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 email TEXT,
 brand TEXT NOT NULL,
 message TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','in_progress','closed')),
 public_note TEXT NOT NULL DEFAULT '',
 private_notes TEXT NOT NULL DEFAULT '',
 ip_hash TEXT NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_enquiries_reference ON enquiries(reference_code);
CREATE INDEX IF NOT EXISTS idx_enquiries_status_created ON enquiries(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_brand_created ON enquiries(brand,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_ip_created ON enquiries(ip_hash,created_at DESC);
CREATE TABLE IF NOT EXISTS platforms (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 domain TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN ('live','coming_soon','maintenance')),
 tagline TEXT NOT NULL DEFAULT '',
 override_message TEXT NOT NULL DEFAULT '',
 is_gated BOOLEAN NOT NULL DEFAULT false,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS platform_checks (
 id BIGSERIAL PRIMARY KEY,
 platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
 status TEXT NOT NULL,
 response_ms INTEGER,
 checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 detail TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_platform_checks_platform_time ON platform_checks(platform_id,checked_at DESC);
CREATE TABLE IF NOT EXISTS announcements (
 id BIGSERIAL PRIMARY KEY,
 title TEXT NOT NULL,
 body TEXT NOT NULL,
 brand TEXT NOT NULL DEFAULT '',
 is_pinned BOOLEAN NOT NULL DEFAULT false,
 published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bookings (
 id BIGSERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 brand TEXT NOT NULL DEFAULT 'SKYLINE Architecture & Design',
 preferred_day TEXT NOT NULL DEFAULT '',
 time_window TEXT NOT NULL DEFAULT '',
 project_type TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'new',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS waitlist (
 id BIGSERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 brand TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS click_events (
 id BIGSERIAL PRIMARY KEY,
 brand TEXT NOT NULL,
 source TEXT NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO platforms(id,name,domain,status,tagline,is_gated) VALUES
('scholars','SCHOLARS UNIVERSITY','https://aischolarhub.online','live','Online learning, courses and skills development.',false),
('tekdid','TEKDiD','https://tekdid.xyz','coming_soon','Trading technology and workflows designed with risk in view.',true),
('skyline','SKYLINE Architecture & Design','','coming_soon','Architecture, interiors and visualisation for more thoughtful spaces.',false),
('nexora-technologies','NEXORA TECHNOLOGIES','','coming_soon','Websites, software, IT services and digital automation.',false)
ON CONFLICT(id) DO NOTHING;
CREATE TABLE IF NOT EXISTS track_lookup_limits (id BIGSERIAL PRIMARY KEY, ip_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_track_lookup_limits_ip_time ON track_lookup_limits(ip_hash,created_at DESC);