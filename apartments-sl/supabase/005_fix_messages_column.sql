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
