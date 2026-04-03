-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('LEADS', 'POSTER', 'BOTH')),
    leads_limit INT NOT NULL DEFAULT 0,
    poster_limit INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL DEFAULT 30,   -- duration in days
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast filtering by category and status
CREATE INDEX IF NOT EXISTS idx_subscription_plans_status   ON subscription_plans(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_category ON subscription_plans(category);
