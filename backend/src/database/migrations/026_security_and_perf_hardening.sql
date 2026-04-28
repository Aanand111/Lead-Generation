-- Migration: 026_security_and_perf_hardening.sql
-- Purpose: Fix critical race conditions and add performance-critical indexes

-- 1. Prevent duplicate lead purchases at the DATABASE level (not just application level)
-- This is the ultimate safety net against race conditions / double-click purchases
ALTER TABLE lead_purchases 
ADD CONSTRAINT unique_user_lead_purchase UNIQUE (user_id, lead_id);

-- 2. Add composite index on lead_purchases (user_id, lead_id) for fast duplicate checks
CREATE INDEX IF NOT EXISTS idx_lead_purchases_user_lead ON lead_purchases (user_id, lead_id);

-- 3. Add index on leads status for available leads query performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);

-- 4. Add index on users role for efficient role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, status);

-- 5. Add index on referrals for referrer lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals (referred_user_id);

-- 6. Add index on transactions for user transaction history
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions (user_id, created_at DESC);

-- 7. Composite index for lead + status queries
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads (status, created_at DESC);
