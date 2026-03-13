-- Fix missing columns in the apartments table
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS available_from DATE NOT NULL DEFAULT NOW();
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS lease_duration_months INTEGER;

-- Ensure the square_feet column also exists (just in case)
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS square_feet INTEGER;

-- Refresh schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
