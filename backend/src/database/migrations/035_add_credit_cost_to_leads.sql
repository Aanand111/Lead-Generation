-- Migration: 035_add_credit_cost_to_leads.sql
-- Add credit_cost column to leads table

ALTER TABLE leads ADD COLUMN IF NOT EXISTS credit_cost INT DEFAULT 10;
