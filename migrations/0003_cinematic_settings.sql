CREATE TABLE IF NOT EXISTS cinematic_settings (
 setting_key TEXT PRIMARY KEY,
 setting_value JSONB NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO cinematic_settings(setting_key,setting_value) VALUES
('scene_enabled', '{"hero":true,"skyline":true,"scholars":true,"technologies":true,"tekdid":true}'::jsonb),
('reduced_effects', 'false'::jsonb),
('quality', '"balanced"'::jsonb)
ON CONFLICT(setting_key) DO NOTHING;