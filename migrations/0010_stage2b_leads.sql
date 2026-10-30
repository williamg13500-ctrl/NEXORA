ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS reference_code TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS ip_hash TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_reference_code_unique ON waitlist(reference_code) WHERE reference_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_created_brand ON waitlist(created_at,brand);
CREATE TABLE IF NOT EXISTS bookings (
 id BIGSERIAL PRIMARY KEY,
 reference_code TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 brand TEXT NOT NULL DEFAULT 'SKYLINE Architecture & Design',
 project_details TEXT NOT NULL,
 preferred_timing TEXT NOT NULL DEFAULT '',
 consent BOOLEAN NOT NULL DEFAULT TRUE,
 status TEXT NOT NULL DEFAULT 'new',
 notes TEXT NOT NULL DEFAULT '',
 ip_hash TEXT NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_created_status ON bookings(created_at,status);