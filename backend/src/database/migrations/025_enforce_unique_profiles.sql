-- Enforce unique user profiles and clean up duplicates
-- This fix ensures that ON CONFLICT (user_id) works correctly and data is retrieved reliably.

-- 1. Remove duplicate profiles, keeping the latest one
DELETE FROM user_profiles a
USING user_profiles b
WHERE a.created_at < b.created_at
AND a.user_id = b.user_id;

-- 2. Add Unique constraint to user_id
ALTER TABLE user_profiles ADD CONSTRAINT unique_user_id UNIQUE (user_id);
