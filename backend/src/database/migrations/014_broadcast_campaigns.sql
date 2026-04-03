-- Migration: 014_broadcast_campaigns.sql
-- Goal: Track state of bulk message jobs (Campaigns)

CREATE TABLE IF NOT EXISTS broadcast_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'PUSH',  -- PUSH, SMS, EMAIL
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
  target_role VARCHAR(20) DEFAULT 'user',
  total_users INT DEFAULT 0,
  processed_users INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optimize status lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON broadcast_campaigns (status);
