-- Runtime scale indexes for high-traffic user, notification, and settlement paths

CREATE INDEX IF NOT EXISTS idx_lead_purchases_user_purchase_date
ON lead_purchases (user_id, purchase_date DESC);

CREATE INDEX IF NOT EXISTS idx_posters_user_created_at
ON posters (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posters_expiry_status
ON posters (status, expiry_date);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_end_date
ON subscriptions (user_id, status, end_date DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created_at
ON notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_referred_by_role_created_at
ON users (referred_by, role, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_commission_transactions_vendor_status_created_at
ON commission_transactions (vendor_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_reference_status
ON transactions (reference_id, status);
