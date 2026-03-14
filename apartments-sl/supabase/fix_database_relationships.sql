-- ============================================================
-- FINAL DATABASE CONNECTION FIX
-- This script fixes the "No relationship between messages and users" error.
-- It explicitly creates the foreign keys that Supabase needs to join data.
-- ============================================================

DO $$ 
BEGIN
    --------------------------------------------------------
    -- 1. FIX THE SENDER RELATIONSHIP
    --------------------------------------------------------
    -- Drop old constraints so we can replace them with clean ones
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
    
    -- Re-add with explicit link to public.users
    ALTER TABLE public.messages 
        ADD CONSTRAINT messages_sender_id_fkey 
        FOREIGN KEY (sender_id) 
        REFERENCES public.users(id) 
        ON DELETE CASCADE;

    --------------------------------------------------------
    -- 2. FIX THE RECIPIENT RELATIONSHIP
    --------------------------------------------------------
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;
    
    ALTER TABLE public.messages 
        ADD CONSTRAINT messages_recipient_id_fkey 
        FOREIGN KEY (recipient_id) 
        REFERENCES public.users(id) 
        ON DELETE CASCADE;

    --------------------------------------------------------
    -- 3. FIX THE APARTMENT RELATIONSHIP
    --------------------------------------------------------
    ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_apartment_id_fkey;
    
    ALTER TABLE public.messages 
        ADD CONSTRAINT messages_apartment_id_fkey 
        FOREIGN KEY (apartment_id) 
        REFERENCES public.apartments(id) 
        ON DELETE SET NULL;

END $$;

--------------------------------------------------------
-- 4. RELOAD EVERYTHING
--------------------------------------------------------
NOTIFY pgrst, 'reload schema';
