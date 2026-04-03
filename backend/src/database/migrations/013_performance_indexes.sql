-- Migration: 013_performance_indexes.sql
-- Goal: Optimize key tables for high-scale lookups (1M+ users)

-- 1. Optimize user lookups by status and role
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

-- 2. Optimize notification retrieval for users
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);

-- 3. Optimize lead lookups
CREATE INDEX IF NOT EXISTS idx_leads_city_state ON leads (city, state);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

-- 4. Optimize transaction history for users
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at DESC);

-- 5. Increase PostgreSQL connection limit (optional, depends on infra)
-- ALTER SYSTEM SET max_connections = 500;
-- SELECT pg_reload_conf();
