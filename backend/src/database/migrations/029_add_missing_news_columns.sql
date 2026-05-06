-- Fix news table missing columns due to 001/007 conflict
-- This migration ensures columns category_id, publish_date, status, and updated_at exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='category_id') THEN
        ALTER TABLE news ADD COLUMN category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='publish_date') THEN
        ALTER TABLE news ADD COLUMN publish_date TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='status') THEN
        ALTER TABLE news ADD COLUMN status BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='updated_at') THEN
        ALTER TABLE news ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;
