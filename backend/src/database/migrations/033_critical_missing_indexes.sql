-- Migration: 033_critical_missing_indexes.sql
-- Purpose: Add indexes for all hot query paths identified in bottleneck analysis.
--          Every index here corresponds to an actual query in the codebase.
--          All use IF NOT EXISTS so this is safe to re-run.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. LEADS TABLE
--    Queries: search by city/category, filter by created_by, status lookups
-- ══════════════════════════════════════════════════════════════════════════════

-- leadModel.js: getAllLeads() filters by city ILIKE, status
-- Already have idx_leads_city_state (013) and idx_leads_status (026),
-- but ILIKE on just city alone is the most common filter path.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'city'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_city ON leads (city)';
    END IF;
END $$;

-- leadModel.js: getAllLeads() joins on created_by, approveLead fetches uploader
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'created_by'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads (created_by)';
    END IF;
END $$;

-- leadModel.js: getAllLeads() filter by category (available leads page)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'category'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_category ON leads (category)';
    END IF;
END $$;

-- availableLeadsController: leads filtered by expiry_date > NOW()
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'expiry_date'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_expiry_date ON leads (expiry_date)';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. USER_PROFILES TABLE
--    Queries: city-based push notifications, pincode lookups
-- ══════════════════════════════════════════════════════════════════════════════

-- notificationService.js L154: sendPushToCity() — WHERE city ILIKE $1
-- This runs on EVERY lead approval (now via worker). Critical path.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'city'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON user_profiles (city)';
    END IF;
END $$;

-- vendorPanelController.js: referUser/referVendor lookups by pincode
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'user_id'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles (user_id)';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. USERS TABLE
--    Queries: referred_by lookups, phone lookups, role+status filters
-- ══════════════════════════════════════════════════════════════════════════════

-- commissionService.js: SELECT referred_by FROM users WHERE id = $1
-- vendorPanelController.js getVendorStats: COUNT WHERE referred_by = $1
-- Already have idx_users_referred_by_role_created_at (028) — covers referred_by
-- but single-column index helps the simple referred_by lookups
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'referred_by'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users (referred_by)';
    END IF;
END $$;

-- authController, passwordResetController: WHERE phone = $1
-- notificationService.js: sendPushToUser() — WHERE phone = $1
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone)';
    END IF;
END $$;

-- vendorPanelController requestSettlement: WHERE role = 'admin'
-- adminLeadController: uploader role checks
-- Already have idx_users_role (013) and idx_users_role_status (026) — sufficient

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. COMMISSION_TRANSACTIONS TABLE
--    Queries: vendor dashboard earnings, settlement requests
-- ══════════════════════════════════════════════════════════════════════════════

-- Already have idx_commission_transactions_vendor_status_created_at (028)
-- which covers (vendor_id, status, created_at DESC) — this is the main one.
-- Adding a lighter index for simple status-only filters across all vendors (admin view)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'commission_transactions' AND column_name = 'status'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_commission_transactions_status ON commission_transactions (status)';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. LEAD_PURCHASES TABLE
--    Queries: purchased leads list, expiry cleanup job
-- ══════════════════════════════════════════════════════════════════════════════

-- maintenanceJobs.js expirePurchasedLeads(): WHERE status = 'ACQUIRED' AND purchase_date < ...
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'lead_purchases' AND column_name = 'status'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'lead_purchases' AND column_name = 'purchase_date'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_lead_purchases_status_purchase_date ON lead_purchases (status, purchase_date)';
    END IF;
END $$;

-- adminLeadModel.js getPurchasedLeads(): lead_id JOIN
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'lead_purchases' AND column_name = 'lead_id'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_lead_purchases_lead_id ON lead_purchases (lead_id)';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. SUBSCRIPTIONS TABLE
--    Queries: renewal check job, user active subscription lookup
-- ══════════════════════════════════════════════════════════════════════════════

-- maintenanceJobs.js checkPackageRenewals():
--   WHERE status = 'Active' AND end_date > NOW() AND end_date <= NOW() + INTERVAL '2 days'
-- Already have idx_subscriptions_user_status_end_date (028) — covers this.
-- Adding end_date standalone for range scans without user_id filter (admin views)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'end_date'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'status'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date_status ON subscriptions (end_date, status)';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. POSTERS TABLE
--    Queries: expiry archiving job, user poster list
-- ══════════════════════════════════════════════════════════════════════════════

-- maintenanceJobs.js archiveExpiredPosters():
--   WHERE expiry_date < NOW() AND status != 'Archived' AND user_id IS NOT NULL
-- Already have idx_posters_expiry_status (028) — covers (status, expiry_date).
-- Adding user_id for the JOIN with users table in the same query
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'posters' AND column_name = 'user_id'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_posters_user_id ON posters (user_id)';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. VENDORS TABLE
--    Queries: registry sync job, referVendor lookups by phone/email
-- ══════════════════════════════════════════════════════════════════════════════

-- vendorPanelController.js referVendor():
--   SELECT id FROM vendors WHERE phone = $1 OR email = $2
-- maintenanceJobs.js syncAllVendorsRegistry():
--   SELECT id FROM vendors WHERE phone = $1 OR email = $2
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name = 'phone'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vendors_phone ON vendors (phone)';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name = 'email'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors (email)';
    END IF;
END $$;

-- Hierarchy sync: WHERE referred_by_vendor_id IS NULL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'vendors' AND column_name = 'referred_by_vendor_id'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vendors_referred_by_vendor_id ON vendors (referred_by_vendor_id)';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. TRANSACTIONS TABLE
--    Queries: user wallet history, Razorpay idempotency check
-- ══════════════════════════════════════════════════════════════════════════════

-- DRozeerpayController.js verifyPayment():
--   WHERE transaction_id = $1  (idempotency check on re-payment)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'transaction_id'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON transactions (transaction_id)';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. NOTIFICATIONS TABLE
--     Queries: unread count, per-user notification list
-- ══════════════════════════════════════════════════════════════════════════════

-- Already have idx_notifications_user_read_created_at (028) — fully covers this.
-- Adding type-based filter for targeted notification fetches
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'type'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type)';
    END IF;
END $$;
