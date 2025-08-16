-- 1) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) App config (kv store)
CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on app_config
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view/manage app config
CREATE POLICY "Only admins can manage app config" 
ON app_config 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 3) Store initial bootstrap settings
INSERT INTO app_config(key, value)
VALUES 
  ('registration_enabled', 'true'),
  ('allowed_domain', 'devmart.sr')
ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = now();

-- 4) SECURITY DEFINER function: one-time admin promotion
CREATE OR REPLACE FUNCTION bootstrap_promote_admin(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count int;
  bootstrap_hash text;
  uid uuid := auth.uid();
  user_email text;
  registration_enabled text;
  allowed_domain text;
BEGIN
  -- Check if user is authenticated
  IF uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Check if registration is enabled
  SELECT value INTO registration_enabled FROM app_config WHERE key = 'registration_enabled';
  IF registration_enabled IS NULL OR registration_enabled != 'true' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration is disabled');
  END IF;

  -- Guard: only when no admin exists
  SELECT count(*) INTO admin_count FROM profiles WHERE role = 'admin';
  IF admin_count > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin already exists in system');
  END IF;

  -- Load stored hash & compare
  SELECT value INTO bootstrap_hash FROM app_config WHERE key = 'bootstrap_hash';
  IF bootstrap_hash IS NULL OR crypt(p_code, bootstrap_hash) <> bootstrap_hash THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid bootstrap code');
  END IF;

  -- Get allowed domain
  SELECT value INTO allowed_domain FROM app_config WHERE key = 'allowed_domain';
  IF allowed_domain IS NULL THEN
    allowed_domain := 'devmart.sr';
  END IF;

  -- Domain check (defense-in-depth)
  SELECT email INTO user_email FROM profiles WHERE id = uid;
  IF user_email IS NULL OR right(lower(user_email), length('@' || allowed_domain)) <> '@' || allowed_domain THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email domain not allowed');
  END IF;

  -- Promote to admin
  UPDATE profiles SET role = 'admin' WHERE id = uid;
  
  -- Disable registration after successful promotion
  UPDATE app_config SET value = 'false', updated_at = now() WHERE key = 'registration_enabled';
  
  RETURN jsonb_build_object('success', true, 'message', 'Successfully promoted to admin');
END $$;

-- 5) Allow only authenticated users to call the function
REVOKE ALL ON FUNCTION bootstrap_promote_admin(text) FROM public;
GRANT EXECUTE ON FUNCTION bootstrap_promote_admin(text) TO authenticated;

-- 6) Function to check if registration is enabled
CREATE OR REPLACE FUNCTION is_registration_enabled()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT value FROM app_config WHERE key = 'registration_enabled'), 'false') = 'true';
$$;

-- Allow public access to check registration status
GRANT EXECUTE ON FUNCTION is_registration_enabled() TO public;

-- 7) Function to set bootstrap hash (admin only)
CREATE OR REPLACE FUNCTION set_bootstrap_hash(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can set bootstrap hash
  IF get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  INSERT INTO app_config(key, value)
  VALUES ('bootstrap_hash', crypt(p_code, gen_salt('bf')))
  ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = now();
  
  RETURN true;
END $$;

GRANT EXECUTE ON FUNCTION set_bootstrap_hash(text) TO authenticated;