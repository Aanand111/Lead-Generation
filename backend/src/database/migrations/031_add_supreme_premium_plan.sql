-- Update category constraint to allow PREMIUM plans
ALTER TABLE subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_category_check;
ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_category_check CHECK (category IN ('LEADS', 'POSTER', 'BOTH', 'PREMIUM'));

-- Insert the Supreme Elite Premium Plan
INSERT INTO subscription_plans (name, category, leads_limit, poster_limit, price, duration, description, status)
SELECT 'SUPREME ELITE PREMIUM', 'PREMIUM', 25, 10, 1499.00, 30, 'The absolute pinnacle of lead generation. Includes Black & Gold VIP dashboard, priority lead delivery, and advanced analytics.', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'SUPREME ELITE PREMIUM');
