-- ============================================================
-- 005_fix_messages_column.sql
-- Renames 'body' -> 'content' in the messages table if the old
-- schema was applied, and drops the now-unused 'subject' column.
-- Safe to run multiple times (idempotent).
-- ============================================================

DO $$
BEGIN
  -- Rename body -> content if body column still exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'messages'
      AND column_name  = 'body'
  ) THEN
    ALTER TABLE public.messages RENAME COLUMN body TO content;
    RAISE NOTICE 'Renamed messages.body -> messages.content';
  ELSE
    RAISE NOTICE 'messages.content already exists, skipping rename';
  END IF;

  -- Drop subject column if it still exists (no longer used by the app)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'messages'
      AND column_name  = 'subject'
  ) THEN
    ALTER TABLE public.messages DROP COLUMN subject;
    RAISE NOTICE 'Dropped messages.subject';
  ELSE
    RAISE NOTICE 'messages.subject already gone, skipping';
  END IF;
END $$;

-- Also add the increment_apartment_views RPC if it doesn't exist yet.
CREATE OR REPLACE FUNCTION public.increment_apartment_views(apartment_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE apartments SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = apartment_id;
END;
$$;

-- Add is_primary column to apartment_images if missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'apartment_images'
      AND column_name  = 'is_primary'
  ) THEN
    ALTER TABLE public.apartment_images
      ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT FALSE;
    RAISE NOTICE 'Added apartment_images.is_primary';
  ELSE
    RAISE NOTICE 'apartment_images.is_primary already exists, skipping';
  END IF;
END $$;

-- Re-install the auth trigger in case it was never applied.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'RENTER')::user_role
  )
  ON CONFLICT (id) DO NOTHING;

  IF (NEW.raw_user_meta_data->>'role' = 'LANDLORD') THEN
    INSERT INTO public.landlord_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

