-- ==========================================
-- COMPREHENSIVE SCHEMA CLEANUP
-- ==========================================
-- This script removes all "phantom" columns that belong to 
-- short-term rental templates (like Airbnb) but aren't used 
-- in this long-term Apartment Rental platform.

-- 1. DROP PROBLEMATIC SHORT-TERM COLUMNS
-- These frequently cause "NOT NULL" constraint errors during insertion
ALTER TABLE apartments DROP COLUMN IF EXISTS max_guests;
ALTER TABLE apartments DROP COLUMN IF EXISTS price_per_night;
ALTER TABLE apartments DROP COLUMN IF EXISTS guests_count;
ALTER TABLE apartments DROP COLUMN IF EXISTS cleaning_fee;
ALTER TABLE apartments DROP COLUMN IF EXISTS service_fee;

-- 2. ENSURE OUR REQUIRED COLUMNS ARE SOLID
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
        CREATE TYPE property_type AS ENUM ('APARTMENT', 'HOUSE', 'STUDIO', 'APARTMENT_BLOCK', 'VILLA');
    END IF;
END $$;

-- 3. ALIGN APARTMENTS TABLE TO THE UI FORM
-- This ensures all fields used in the "New Property" form are correctly represented
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

-- 4. ENSURE NULLABILITY FOR OPTIONAL FIELDS
-- Fields that might be optional in the UI should not be NOT NULL in the DB
ALTER TABLE apartments ALTER COLUMN square_feet DROP NOT NULL;
ALTER TABLE apartments ALTER COLUMN lease_duration_months DROP NOT NULL;
ALTER TABLE apartments ALTER COLUMN bathrooms DROP NOT NULL;

-- 5. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

COMMIT;
