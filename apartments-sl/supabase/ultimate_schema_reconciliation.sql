-- ============================================================
-- ULTIMATE SCHEMA RECONCILIATION SCRIPT
-- This script aligns the database with the application code.
-- It handles column renames, missing columns, and foreign keys.
-- ============================================================

DO $$ 
BEGIN
    --------------------------------------------------------
    -- 1. MESSAGES TABLE RECONCILIATION
    --------------------------------------------------------
    
    -- Rename 'receiver_id' -> 'recipient_id' if it exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'receiver_id') THEN
        ALTER TABLE public.messages RENAME COLUMN receiver_id TO recipient_id;
    END IF;

    -- Rename 'body' -> 'content' if it exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'body') THEN
        ALTER TABLE public.messages RENAME COLUMN body TO content;
    END IF;

    -- Ensure 'apartment_id' exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'apartment_id') THEN
        ALTER TABLE public.messages ADD COLUMN apartment_id UUID REFERENCES public.apartments(id) ON DELETE SET NULL;
    END IF;

    -- Ensure 'sender_id' exists (basic requirement)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id') THEN
        ALTER TABLE public.messages ADD COLUMN sender_id UUID NOT NULL REFERENCES auth.users(id);
    END IF;

    -- Ensure 'recipient_id' exists and is NOT NULL
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'recipient_id') THEN
        ALTER TABLE public.messages ADD COLUMN recipient_id UUID NOT NULL REFERENCES auth.users(id);
    ELSE
        ALTER TABLE public.messages ALTER COLUMN recipient_id SET NOT NULL;
    END IF;

    --------------------------------------------------------
    -- 2. APARTMENTS TABLE RECONCILIATION
    --------------------------------------------------------
    
    -- Ensure multi-unit block fields exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'apartments' AND column_name = 'is_entire_block') THEN
        ALTER TABLE public.apartments ADD COLUMN is_entire_block BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'apartments' AND column_name = 'total_units') THEN
        ALTER TABLE public.apartments ADD COLUMN total_units INTEGER DEFAULT 1;
    END IF;

    --------------------------------------------------------
    -- 3. APARTMENT IMAGES RECONCILIATION
    --------------------------------------------------------
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'apartment_images' AND column_name = 'caption') THEN
        ALTER TABLE public.apartment_images ADD COLUMN caption TEXT;
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'apartment_images' AND column_name = 'is_primary') THEN
        ALTER TABLE public.apartment_images ADD COLUMN is_primary BOOLEAN DEFAULT FALSE;
    END IF;

END $$;

--------------------------------------------------------
-- 4. RE-APPLY RLS POLICIES FOR MESSAGES
--------------------------------------------------------

-- Clean up any existing policies
DROP POLICY IF EXISTS "Users can view sent messages" ON messages;
DROP POLICY IF EXISTS "Users can view received messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Recipients can mark messages as read" ON messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON messages;

-- Re-enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Apply standard user policies
CREATE POLICY "Users can view sent messages" ON messages FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Users can view received messages" ON messages FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients can mark messages as read" ON messages FOR UPDATE USING (auth.uid() = recipient_id);

-- Apply Super Admin policies (for medalbarrie@gmail.com)
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage all messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

--------------------------------------------------------
-- 5. RELOAD SCHEMA CACHE
--------------------------------------------------------
NOTIFY pgrst, 'reload schema';
