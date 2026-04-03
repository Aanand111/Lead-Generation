-- Migration for Quality Control Feedback and Ratings (Section 11.1.2)
-- Allows users to report bad leads and helps Admin monitor vendor performance.

CREATE TABLE IF NOT EXISTS lead_feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, INVESTIGATING, RESOLVED, REJECTED
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add average rating and report count to users table (performance optimization)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='vendor_rating') THEN
        ALTER TABLE users ADD COLUMN vendor_rating DECIMAL(3, 2) DEFAULT 5.0;
        ALTER TABLE users ADD COLUMN reports_count INTEGER DEFAULT 0;
    END IF;
END $$;
