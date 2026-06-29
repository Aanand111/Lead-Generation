-- Migration: 037_add_error_log_to_campaigns.sql
-- Purpose: Support logging of failed campaign execution errors (Task 38).

ALTER TABLE broadcast_campaigns ADD COLUMN IF NOT EXISTS error_log TEXT;
