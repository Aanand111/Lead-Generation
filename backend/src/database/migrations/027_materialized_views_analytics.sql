-- Phase 5: Advanced Scaling (Materialized Views)

-- 1. Create a view for User Stats Summary
-- This avoids doing heavy JOINs and COUNTs on every dashboard refresh.
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_stats AS
SELECT 
    u.id as user_id,
    u.wallet_balance,
    u.referral_code,
    (SELECT COUNT(*) FROM lead_purchases lp WHERE lp.user_id = u.id) as total_leads,
    (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id = u.id) as total_referrals,
    (SELECT COUNT(*) FROM posters p WHERE p.user_id = u.id AND p.created_at >= CURRENT_DATE) as todays_posters
FROM users u;

-- 2. Create index on the materialized view for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_stats_user_id ON mv_user_stats (user_id);

-- 3. Function to refresh the view
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_stats;
END;
$$ LANGUAGE plpgsql;
