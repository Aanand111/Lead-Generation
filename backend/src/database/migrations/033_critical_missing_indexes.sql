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
CREATE INDEX IF NOT EXISTS idx_leads_city
    ON leads (city);

-- leadModel.js: getAllLeads() joins on created_by, approveLead fetches uploader
CREATE INDEX IF NOT EXISTS idx_leads_created_by
    ON leads (created_by);

-- leadModel.js: getAllLeads() filter by category (available leads page)
CREATE INDEX IF NOT EXISTS idx_leads_category
    ON leads (category);

-- availableLeadsController: leads filtered by expiry_date > NOW()
CREATE INDEX IF NOT EXISTS idx_leads_expiry_date
    ON leads (expiry_date);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. USER_PROFILES TABLE
--    Queries: city-based push notifications, pincode lookups
-- ══════════════════════════════════════════════════════════════════════════════

-- notificationService.js L154: sendPushToCity() — WHERE city ILIKE $1
-- This runs on EVERY lead approval (now via worker). Critical path.
CREATE INDEX IF NOT EXISTS idx_user_profiles_city
    ON user_profiles (city);

-- vendorPanelController.js: referUser/referVendor lookups by pincode
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
    ON user_profiles (user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. USERS TABLE
--    Queries: referred_by lookups, phone lookups, role+status filters
-- ══════════════════════════════════════════════════════════════════════════════

-- commissionService.js: SELECT referred_by FROM users WHERE id = $1
-- vendorPanelController.js getVendorStats: COUNT WHERE referred_by = $1
-- Already have idx_users_referred_by_role_created_at (028) — covers referred_by
-- but single-column index helps the simple referred_by lookups
CREATE INDEX IF NOT EXISTS idx_users_referred_by
    ON users (referred_by);

-- authController, passwordResetController: WHERE phone = $1
-- notificationService.js: sendPushToUser() — WHERE phone = $1
CREATE INDEX IF NOT EXISTS idx_users_phone
    ON users (phone);

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
CREATE INDEX IF NOT EXISTS idx_commission_transactions_status
    ON commission_transactions (status);

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. LEAD_PURCHASES TABLE
--    Queries: purchased leads list, expiry cleanup job
-- ══════════════════════════════════════════════════════════════════════════════

-- maintenanceJobs.js expirePurchasedLeads(): WHERE status = 'ACQUIRED' AND purchase_date < ...
CREATE INDEX IF NOT EXISTS idx_lead_purchases_status_purchase_date
    ON lead_purchases (status, purchase_date);

-- adminLeadModel.js getPurchasedLeads(): lead_id JOIN
CREATE INDEX IF NOT EXISTS idx_lead_purchases_lead_id
    ON lead_purchases (lead_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. SUBSCRIPTIONS TABLE
--    Queries: renewal check job, user active subscription lookup
-- ══════════════════════════════════════════════════════════════════════════════

-- maintenanceJobs.js checkPackageRenewals():
--   WHERE status = 'Active' AND end_date > NOW() AND end_date <= NOW() + INTERVAL '2 days'
-- Already have idx_subscriptions_user_status_end_date (028) — covers this.
-- Adding end_date standalone for range scans without user_id filter (admin views)
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date_status
    ON subscriptions (end_date, status);

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. POSTERS TABLE
--    Queries: expiry archiving job, user poster list
-- ══════════════════════════════════════════════════════════════════════════════

-- maintenanceJobs.js archiveExpiredPosters():
--   WHERE expiry_date < NOW() AND status != 'Archived' AND user_id IS NOT NULL
-- Already have idx_posters_expiry_status (028) — covers (status, expiry_date).
-- Adding user_id for the JOIN with users table in the same query
CREATE INDEX IF NOT EXISTS idx_posters_user_id
    ON posters (user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. VENDORS TABLE
--    Queries: registry sync job, referVendor lookups by phone/email
-- ══════════════════════════════════════════════════════════════════════════════

-- vendorPanelController.js referVendor():
--   SELECT id FROM vendors WHERE phone = $1 OR email = $2
-- maintenanceJobs.js syncAllVendorsRegistry():
--   SELECT id FROM vendors WHERE phone = $1 OR email = $2
CREATE INDEX IF NOT EXISTS idx_vendors_phone
    ON vendors (phone);

CREATE INDEX IF NOT EXISTS idx_vendors_email
    ON vendors (email);

-- Hierarchy sync: WHERE referred_by_vendor_id IS NULL
CREATE INDEX IF NOT EXISTS idx_vendors_referred_by_vendor_id
    ON vendors (referred_by_vendor_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. TRANSACTIONS TABLE
--    Queries: user wallet history, Razorpay idempotency check
-- ══════════════════════════════════════════════════════════════════════════════

-- DRozeerpayController.js verifyPayment():
--   WHERE transaction_id = $1  (idempotency check on re-payment)
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id
    ON transactions (transaction_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. NOTIFICATIONS TABLE
--     Queries: unread count, per-user notification list
-- ══════════════════════════════════════════════════════════════════════════════

-- Already have idx_notifications_user_read_created_at (028) — fully covers this.
-- Adding type-based filter for targeted notification fetches
CREATE INDEX IF NOT EXISTS idx_notifications_type
    ON notifications (type);
