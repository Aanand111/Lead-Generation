-- Migration: 038_add_poster_categories_table.sql
-- Purpose: Create poster_categories table and add missing columns to posters table.

CREATE TABLE IF NOT EXISTS poster_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) UNIQUE NOT NULL,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE posters ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES poster_categories(id) ON DELETE SET NULL;
ALTER TABLE posters ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE posters ADD COLUMN IF NOT EXISTS language VARCHAR(50);
ALTER TABLE posters ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
