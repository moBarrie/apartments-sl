-- FIX: Add missing columns to apartment_images table
-- This resolves the "column does not exist" errors in the UI
ALTER TABLE apartment_images ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE apartment_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;
ALTER TABLE apartment_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Refresh the PostgREST cache
NOTIFY pgrst, 'reload schema';
