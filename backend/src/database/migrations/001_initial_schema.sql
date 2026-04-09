-- Initial Schema Migration

-- Users (role: admin, vendor, user)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  fcm_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  last_login TIMESTAMP
);

-- User profiles (vendor/user details)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(200),
  business_type VARCHAR(100),
  gst_number VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  profile_image TEXT,
  kyc_status VARCHAR(20) DEFAULT 'PENDING',
  bank_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads (only admin can upload)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(15),
  customer_email VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  lead_value DECIMAL(10,2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lead purchases (user acquires lead)
CREATE TABLE IF NOT EXISTS lead_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  lead_id UUID REFERENCES leads(id),
  lead_price numeric,
  credits_used INT,
  customer_name TEXT,
  purchase_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'ACQUIRED',
  expiry_date TIMESTAMP,
  lead_status VARCHAR(20) DEFAULT 'NEW',
  lead_name TEXT,
  remaing_lead numeric,
  last_updated_by UUID REFERENCES users(id)
);

-- Lead history (track status changes)
CREATE TABLE IF NOT EXISTS lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_purchase_id UUID REFERENCES lead_purchases(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50),
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  remark TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Packages
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  type VARCHAR(20) CHECK (type IN ('CREDIT_BASED', 'SUBSCRIPTION')),
  category VARCHAR(20) CHECK (category IN ('LEADS', 'POSTER', 'BOTH')),
  price DECIMAL(10,2),
  credits INT,
  lead_limit INT,
  validity_days INT,
  description TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  sort_order INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User packages (purchased packages)
CREATE TABLE IF NOT EXISTS user_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  package_id UUID REFERENCES packages(id),
  credits_remaining INT,
  leads_remaining INT,
  purchase_date TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  payment_id VARCHAR(100)
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id),
  referred_user_id UUID REFERENCES users(id),
  referral_code VARCHAR(20),
  status VARCHAR(20) DEFAULT 'PENDING',
  commission_earned DECIMAL(10,2) DEFAULT 0,
  commission_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Commission transactions (for vendor payouts)
CREATE TABLE IF NOT EXISTS commission_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES users(id),
  referral_id UUID REFERENCES referrals(id),
  amount DECIMAL(10,2),
  type VARCHAR(50) DEFAULT 'REFERRAL_COMMISSION',
  status VARCHAR(20) DEFAULT 'PENDING',
  payment_reference VARCHAR(100),
  payment_date TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posters (user-generated)
CREATE TABLE IF NOT EXISTS posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200),
  content TEXT,
  logo TEXT,
  image TEXT,
  category VARCHAR(100),
  template VARCHAR(100),
  credits_used INT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  expiry_date TIMESTAMP,
  views INT DEFAULT 0,
  shares INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions (payment/wallet logs)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) CHECK (type IN ('PURCHASE', 'REFERRAL_CREDIT', 'PAYOUT')),
  amount DECIMAL(10,2),
  credits INT,
  payment_method VARCHAR(50),
  payment_gateway VARCHAR(50),
  transaction_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'PENDING',
  reference_id VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200),
  image TEXT,
  link TEXT,
  type VARCHAR(50),
  placement VARCHAR(50),
  clicks INT DEFAULT 0,
  views INT DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- News
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200),
  content TEXT,
  image TEXT,
  type VARCHAR(50),
  target_audience VARCHAR(50),
  is_push_notification BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200),
  body TEXT,
  type VARCHAR(50),
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pincode master
CREATE TABLE IF NOT EXISTS pincodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode VARCHAR(10),
  city VARCHAR(100),
  state VARCHAR(100),
  region VARCHAR(100),
  is_active BOOLEAN DEFAULT true
);
