-- 1. Add ADMIN to the user_role enum
-- PostgreSQL doesn't allow ALTER TYPE ... ADD VALUE inside a transaction block easily,
-- and sometimes it's better to just ensure it exists.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('LANDLORD', 'RENTER', 'ADMIN');
    ELSE
        BEGIN
            ALTER TYPE user_role ADD VALUE 'ADMIN';
        EXCEPTION
            WHEN duplicate_object THEN null;
        END;
    END IF;
END $$;

-- 2. Add Super Admin Policies
-- This allows any user with role = 'ADMIN' to see and manage everything
DROP POLICY IF EXISTS "Admins can see everything" ON apartments;
CREATE POLICY "Admins can see everything" ON apartments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "Admins can see all images" ON apartment_images;
CREATE POLICY "Admins can see all images" ON apartment_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- 3. Trigger schema refresh
NOTIFY pgrst, 'reload schema';
