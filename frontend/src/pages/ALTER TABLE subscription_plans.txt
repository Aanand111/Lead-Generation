ALTER TABLE subscription_plans
DROP CONSTRAINT IF EXISTS subscription_plans_category_check;

ALTER TABLE subscription_plans
ADD CONSTRAINT subscription_plans_category_check
CHECK (category IN ('LEADS', 'POSTER', 'BOTH'));
