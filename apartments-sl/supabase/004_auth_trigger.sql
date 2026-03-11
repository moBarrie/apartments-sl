-- ============================================================
-- 004_auth_trigger.sql
-- Auto-creates public.users + landlord_profiles rows the
-- moment a new Supabase auth user is created.
-- Runs as SECURITY DEFINER (postgres role) so it bypasses RLS
-- and works whether email confirmation is on or off.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create the public profile row using metadata stored during sign-up
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'RENTER')::user_role
  )
  ON CONFLICT (id) DO NOTHING; -- safe to re-run

  -- If the user registered as a landlord, create the landlord profile too
  IF (NEW.raw_user_meta_data->>'role' = 'LANDLORD') THEN
    INSERT INTO public.landlord_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate so the migration is idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
