-- Add credits column to subscription_plans if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscription_plans' AND column_name = 'credits'
    ) THEN
        ALTER TABLE subscription_plans ADD COLUMN credits INT NOT NULL DEFAULT 0;
        RAISE NOTICE 'credits column added to subscription_plans';
    ELSE
        RAISE NOTICE 'credits column already exists in subscription_plans';
    END IF;
END $$;

-- Ensure the category constraint allows PREMIUM (idempotent)
ALTER TABLE subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_category_check;
ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_category_check 
    CHECK (category IN ('LEADS', 'POSTER', 'BOTH', 'PREMIUM'));

-- Update any existing PREMIUM plans to have both leads + posters access (credits = 500 default)
UPDATE subscription_plans 
SET credits = CASE WHEN credits = 0 THEN 500 ELSE credits END
WHERE category = 'PREMIUM';

-- Ensure Supreme Elite Premium plan exists with correct data
INSERT INTO subscription_plans (name, category, leads_limit, poster_limit, credits, price, duration, description, status)
SELECT 
    'SUPREME ELITE PREMIUM', 
    'PREMIUM', 
    25,     -- leads
    10,     -- posters  
    500,    -- credits
    1499.00, 
    30, 
    'The absolute pinnacle of lead generation. Includes Black & Gold VIP dashboard, 25 Leads, 10 Posters, 500 Credits, priority lead delivery, and advanced analytics.', 
    'Active'
WHERE NOT EXISTS (
    SELECT 1 FROM subscription_plans WHERE name = 'SUPREME ELITE PREMIUM'
);
