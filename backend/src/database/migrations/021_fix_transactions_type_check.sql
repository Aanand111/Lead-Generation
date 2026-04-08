-- Update transactions table type check constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('PURCHASE', 'REFERRAL_CREDIT', 'PAYOUT', 'PLAN_PURCHASE', 'CREDIT', 'DEBIT', 'WALLET_ADJUSTMENT'));
