-- Commission Tracking System Migration
-- This table logs every commission event for vendors to ensure dynamic payout transparency.

CREATE TABLE IF NOT EXISTS commission_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) DEFAULT 'REFERRAL_COMMISSION', -- REFERRAL_COMMISSION, LEAD_SALE, etc.
    status VARCHAR(20) DEFAULT 'COMPLETED', -- COMPLETED, PENDING, REVERSED
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster vendor report generation
CREATE INDEX IF NOT EXISTS idx_commission_vendor ON commission_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_commission_created_at ON commission_transactions(created_at);

COMMENT ON TABLE commission_transactions IS 'Logs all vendor earnings from referrals and sales for audit and payout calculations.';
