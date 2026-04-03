-- Migration to support Predefined Poster Templates with Customizable Fields (Section 11.1.8)
-- Stores the layout configuration (coordinates, font styles, colors) for dynamic poster rendering.

ALTER TABLE posters ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{
    "fields": [
        {"id": "logo", "label": "Logo", "type": "image", "x": 20, "y": 20, "width": 80, "height": 80},
        {"id": "title", "label": "Main Title", "type": "text", "x": 120, "y": 40, "fontSize": 24, "fontWeight": "bold", "color": "#000000"},
        {"id": "content", "label": "Description", "type": "text", "x": 20, "y": 120, "fontSize": 16, "width": 300}
    ]
}';

-- Ensure updated_at is consistently tracked
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posters' AND column_name='updated_at') THEN
        ALTER TABLE posters ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;
