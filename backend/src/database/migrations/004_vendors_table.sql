-- Vendors table for separate vendor management not linked to users

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150),
  gender VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(150),
  password VARCHAR(255),
  referral_code VARCHAR(50),
  referred_by_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  commission_balance DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
