-- Promote info@devmart.sr to admin role since no admin exists
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'info@devmart.sr' AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE role = 'admin'
);