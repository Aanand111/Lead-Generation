-- Fix lead_purchases table schema
ALTER TABLE lead_purchases ADD COLUMN IF NOT EXISTS total_leads numeric DEFAULT 1;
-- Ensure remaing_lead is present and has correct default
ALTER TABLE lead_purchases ALTER COLUMN remaing_lead SET DEFAULT 1;
-- Add index for better performance on admin dashboard
CREATE INDEX IF NOT EXISTS idx_lead_purchases_user_id ON lead_purchases(user_id);
