-- 1. Drop the constraint first
ALTER TABLE subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_category_check;

-- 2. Normalize and ensure all data satisfies a consistent set
-- We'll include PREMIUM since it exists in the data
UPDATE subscription_plans 
SET category = CASE 
    WHEN category ILIKE 'Lead%'    THEN 'LEADS'
    WHEN category ILIKE 'Poster%'  THEN 'POSTER'
    WHEN category ILIKE 'Both%'    THEN 'BOTH'
    WHEN category ILIKE 'Premium%' THEN 'PREMIUM'
    ELSE 'LEADS'
END;

-- 3. Trim and Upper
UPDATE subscription_plans SET category = TRIM(UPPER(category));

-- 4. Re-add the inclusive constraint
ALTER TABLE subscription_plans
ADD CONSTRAINT subscription_plans_category_check
CHECK (category IN ('LEADS', 'POSTER', 'BOTH', 'PREMIUM'));
