-- Subscriptions Table (User's active/expired plans)
CREATE TABLE IF NOT EXISTS subscriptions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL,
    plan_id        UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    total_leads    INT NOT NULL DEFAULT 0,
    used_leads     INT NOT NULL DEFAULT 0,
    total_posters  INT NOT NULL DEFAULT 0,
    used_posters   INT NOT NULL DEFAULT 0,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Cancelled')),
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id  ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id  ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status   ON subscriptions(status);
