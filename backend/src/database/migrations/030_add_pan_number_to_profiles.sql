-- Add PAN Number to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20);

COMMENT ON COLUMN user_profiles.pan_number IS 'PAN Card number for financial verification and tax compliance';
