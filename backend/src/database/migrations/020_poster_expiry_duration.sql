-- Migration to support Poster Expiry/Duration setting
-- Adds duration_days to posters table (for templates)
-- Section 11.1.8

ALTER TABLE posters ADD COLUMN IF NOT EXISTS duration_days INT DEFAULT 30;

-- Optional: Update existing templates to have a default duration
UPDATE posters SET duration_days = 30 WHERE user_id IS NULL AND duration_days IS NULL;
