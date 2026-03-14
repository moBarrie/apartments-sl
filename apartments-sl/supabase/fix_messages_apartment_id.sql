-- FIX: Ensure 'apartment_id' column exists in 'messages' table
-- This column is required for linking inquiries to specific properties

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'apartment_id'
    ) THEN
        ALTER TABLE messages ADD COLUMN apartment_id UUID REFERENCES apartments(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added apartment_id column to messages table';
    END IF;
END $$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
