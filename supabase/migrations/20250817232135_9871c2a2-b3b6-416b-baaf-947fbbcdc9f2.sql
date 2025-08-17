-- Fix security warnings: Add search_path to functions

-- Fix prevent_last_admin_demotion function
CREATE OR REPLACE FUNCTION public.prevent_last_admin_demotion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    admin_count INT;
BEGIN
    -- Only check if role is being changed from admin
    IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
        SELECT COUNT(*) INTO admin_count 
        FROM public.profiles 
        WHERE role = 'admin' AND id != NEW.id;
        
        IF admin_count = 0 THEN
            RAISE EXCEPTION 'Cannot demote the last admin. At least one admin must remain.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Fix redact_pii function
CREATE OR REPLACE FUNCTION public.redact_pii(input_text TEXT)
RETURNS TEXT 
LANGUAGE plpgsql 
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Redact email patterns
    input_text := regexp_replace(input_text, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL_REDACTED]', 'g');
    
    -- Redact phone number patterns
    input_text := regexp_replace(input_text, '(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}', '[PHONE_REDACTED]', 'g');
    
    -- Redact potential tokens (long alphanumeric strings)
    input_text := regexp_replace(input_text, '\b[A-Za-z0-9]{32,}\b', '[TOKEN_REDACTED]', 'g');
    
    RETURN input_text;
END;
$$;