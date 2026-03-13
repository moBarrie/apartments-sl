-- ============================================================
-- MINIMAL AUTH FIX — Run this in the Supabase SQL Editor
-- Fixes the "access denied" sign-in bug WITHOUT requiring
-- the full schema to be applied first.
-- ============================================================

-- Step 1: Ensure the user_role enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('LANDLORD', 'RENTER');
    RAISE NOTICE 'Created user_role enum';
  ELSE
    RAISE NOTICE 'user_role enum already exists';
  END IF;
END $$;

-- Step 2: Ensure the public.users table exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'RENTER',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Ensure the landlord_profiles table exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS public.landlord_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  tax_id TEXT,
  verification_status TEXT DEFAULT 'PENDING',
  verification_documents JSONB,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 4: Enable RLS on users and allow authenticated users to read/write their own row
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can view own profile"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE public.landlord_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Landlords can view own profile"   ON public.landlord_profiles;
DROP POLICY IF EXISTS "Landlords can update own profile" ON public.landlord_profiles;
DROP POLICY IF EXISTS "Landlords can insert own profile" ON public.landlord_profiles;

CREATE POLICY "Landlords can view own profile"   ON public.landlord_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Landlords can update own profile" ON public.landlord_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Landlords can insert own profile" ON public.landlord_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 5: Install the auth trigger so new signups auto-create a profile row
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
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  -- Re-handle landlord profile if needed
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

-- Step 6: Back-fill any existing auth users that are missing a public.users row
-- (This fixes anyone who already signed up before the trigger was installed)
INSERT INTO public.users (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'role', 'RENTER')::user_role
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Step 7: Back-fill landlord_profiles for LANDLORD users
INSERT INTO public.landlord_profiles (user_id)
SELECT id FROM public.users
WHERE role = 'LANDLORD'
  AND NOT EXISTS (
    SELECT 1 FROM public.landlord_profiles lp WHERE lp.user_id = users.id
  );

-- Done!
-- All existing accounts can now sign in.
-- All future signups will auto-create their profile row.
