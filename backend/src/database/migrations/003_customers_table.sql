-- Customers table for separate customer management not linked to users

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_pic TEXT,
  name VARCHAR(150),
  email VARCHAR(150),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  referral VARCHAR(50),
  state VARCHAR(100),
  city VARCHAR(100),
  pincode VARCHAR(20),
  designation VARCHAR(100),
  domain VARCHAR(100),
  company VARCHAR(150),
  other_company VARCHAR(150),
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
