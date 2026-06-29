-- Migration: 036_add_leads_assigned_to_index.sql
-- Purpose: Optimize sub-vendor and vendor query response times by indexing assigned_to field.

CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads (assigned_to);
