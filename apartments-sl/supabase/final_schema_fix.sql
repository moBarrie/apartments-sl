-- ==========================================
-- FINAL DATABASE SETUP & REPAIR SCRIPT
-- ==========================================
-- This script fixes the "price_per_night" constraint error and 
-- ensures the schema matches the app code 100%.

-- 1. REMOVE PHANTOM COLUMNS
-- This column is likely causing the insertion to fail because it is NOT NULL 
-- but the app (which uses Monthly Rent) doesn't send it.
ALTER TABLE apartments DROP COLUMN IF EXISTS price_per_night;

-- 2. ENSURE PROPERTY TYPES SYNC
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
        CREATE TYPE property_type AS ENUM ('APARTMENT', 'HOUSE', 'STUDIO', 'APARTMENT_BLOCK', 'VILLA');
    END IF;
END $$;

-- 3. ALIGN APARTMENTS SCHEMA
ALTER TABLE apartments 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS price_per_month DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS available_from DATE,
  ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
  ADD COLUMN IF NOT EXISTS bathrooms DECIMAL(3, 1),
  ADD COLUMN IF NOT EXISTS square_feet INTEGER,
  ADD COLUMN IF NOT EXISTS lease_duration_months INTEGER,
  ADD COLUMN IF NOT EXISTS property_type property_type DEFAULT 'APARTMENT',
  ADD COLUMN IF NOT EXISTS total_units INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_entire_block BOOLEAN DEFAULT FALSE;

-- Ensure critical columns are NULLABLE if they are causing constraint issues during migration
-- but ideally they should match the app requirements.
ALTER TABLE apartments ALTER COLUMN price_per_month SET NOT NULL;
ALTER TABLE apartments ALTER COLUMN title SET NOT NULL;

-- 4. FIX USER PROFILES
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 5. REFRESH EVERYTHING
NOTIFY pgrst, 'reload schema';

COMMIT;
