-- Add custom commission rate column to users table
ALTER TABLE users ADD COLUMN custom_commission_rate DECIMAL(5,2) DEFAULT NULL;

COMMENT ON COLUMN users.custom_commission_rate IS 'Individual vendor commission percentage. Overrides global setting if set.';
