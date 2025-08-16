-- Pre-flight hardening tasks

-- 1. Disable registration now that admin exists
UPDATE app_config 
SET value = 'false', updated_at = now() 
WHERE key = 'registration_enabled';

-- 2. Invalidate existing bootstrap hash (rotate to random value)
UPDATE app_config 
SET value = crypt(gen_random_uuid()::text, gen_salt('bf')), updated_at = now() 
WHERE key = 'bootstrap_hash';

-- 3. Strengthen app_config RLS - only admins can access
DROP POLICY IF EXISTS "Only admins can manage app config" ON app_config;

CREATE POLICY "Only admins can view app config" 
ON app_config 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can modify app config" 
ON app_config 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 4. Add index for better performance on key lookups
CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);

-- 5. Add comment for documentation
COMMENT ON TABLE app_config IS 'Application configuration key-value store. Admin access only.';