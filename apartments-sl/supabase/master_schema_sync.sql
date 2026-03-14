-- ==========================================
-- MASTER SCHEMA SYNC & FIX SCRIPT
-- ==========================================
-- Run this in your Supabase SQL Editor to ensure all tables 
-- and columns match the latest application requirements.

-- 1. FIX USERS TABLE
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. FIX APARTMENTS TABLE (Core Columns)
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS price_per_month DECIMAL(10, 2);
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2);
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS bathrooms DECIMAL(3, 1);
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS square_feet INTEGER;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS lease_duration_months INTEGER;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DRAFT';

-- 3. ADD SUPPORT FOR APARTMENT BLOCKS & LISTING TYPES
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
        CREATE TYPE property_type AS ENUM ('APARTMENT', 'HOUSE', 'STUDIO', 'APARTMENT_BLOCK', 'VILLA');
    END IF;
END $$;

ALTER TABLE apartments ADD COLUMN IF NOT EXISTS property_type property_type DEFAULT 'APARTMENT';
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS total_units INTEGER DEFAULT 1; -- For blocks/multi-unit buildings
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS is_entire_block BOOLEAN DEFAULT FALSE;

-- 4. FIX APARTMENT IMAGES
ALTER TABLE apartment_images ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE apartment_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 5. REFRESH SCHEMA CACHE
-- This is critical so the API notices the new columns
NOTIFY pgrst, 'reload schema';

COMMENT ON COLUMN apartments.is_entire_block IS 'True if listing the whole building/block, False if individual unit';
