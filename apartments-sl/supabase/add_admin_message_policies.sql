-- Add Admin Policies for Messages table
-- Allows admins to view all platform inquiries for auditing and support
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Also allow admins to delete/manage if necessary
DROP POLICY IF EXISTS "Admins can manage all messages" ON messages;
CREATE POLICY "Admins can manage all messages" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
