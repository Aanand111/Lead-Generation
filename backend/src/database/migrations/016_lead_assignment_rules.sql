-- Migration for Lead Assignment Rules (Section 11.1.2)
-- Stores which pincodes and categories each vendor is responsible for.

-- 1. Vendor Operating Pincodes
CREATE TABLE IF NOT EXISTS vendor_pincodes (
    id SERIAL PRIMARY KEY,
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pincode VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vendor_id, pincode)
);

-- 2. Vendor Operating Categories
CREATE TABLE IF NOT EXISTS vendor_categories (
    id SERIAL PRIMARY KEY,
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES lead_categories(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vendor_id, category_id)
);

-- 3. Add assignee_type and assigned_at to leads table if not already there 
-- (Initial schema had created_by, but assignment needs tracker)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='assigned_to') THEN
        ALTER TABLE leads ADD COLUMN assigned_to UUID REFERENCES users(id);
        ALTER TABLE leads ADD COLUMN assigned_at TIMESTAMP;
        ALTER TABLE leads ADD COLUMN assignment_status VARCHAR(20) DEFAULT 'UNASSIGNED';
    END IF;
END $$;
