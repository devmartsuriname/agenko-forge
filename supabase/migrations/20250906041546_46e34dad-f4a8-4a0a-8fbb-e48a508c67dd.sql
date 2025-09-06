-- Phase 1: Database Content Cleanup (Fixed)
-- Add validation constraints to prevent future cache/hydration issues

-- 1. Ensure only one home page exists
CREATE UNIQUE INDEX IF NOT EXISTS unique_home_page ON pages (slug) WHERE slug = 'home';

-- 2. Add constraint to ensure body has proper structure when not null
-- Allow sections, content, or blocks structure
ALTER TABLE pages ADD CONSTRAINT valid_body_structure 
CHECK (
  body IS NULL OR (
    jsonb_typeof(body) = 'object' AND
    (body ? 'sections' OR body ? 'content' OR body ? 'blocks')
  )
);

-- 3. Add constraint to ensure sections/blocks is an array when present
ALTER TABLE pages ADD CONSTRAINT valid_content_arrays
CHECK (
  body IS NULL OR 
  (body->'sections' IS NULL OR jsonb_typeof(body->'sections') = 'array') AND
  (body->'blocks' IS NULL OR jsonb_typeof(body->'blocks') = 'array')
);

-- 4. Create function to validate section structure for homepage sections
CREATE OR REPLACE FUNCTION validate_page_sections(sections jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    section jsonb;
BEGIN
    -- Return true if sections is null (optional field)
    IF sections IS NULL THEN
        RETURN true;
    END IF;
    
    -- Sections must be an array
    IF jsonb_typeof(sections) != 'array' THEN
        RETURN false;
    END IF;
    
    -- Validate each section has required fields for homepage sections
    FOR section IN SELECT jsonb_array_elements(sections)
    LOOP
        -- Each section must have type and id
        IF NOT (section ? 'type' AND section ? 'id') THEN
            RETURN false;
        END IF;
        
        -- Section type must be a string
        IF jsonb_typeof(section->'type') != 'string' THEN
            RETURN false;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$;

-- 5. Add constraint for homepage sections validation (only when sections exists)
ALTER TABLE pages ADD CONSTRAINT valid_homepage_sections
CHECK (
  body->'sections' IS NULL OR 
  validate_page_sections(body->'sections')
);

-- 6. Add trigger to automatically set updated_at on body changes
CREATE OR REPLACE FUNCTION update_page_cache_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update timestamp when body content changes
    IF OLD.body IS DISTINCT FROM NEW.body THEN
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER page_body_update_trigger
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_page_cache_timestamp();

-- 7. Create index for better query performance on published pages
CREATE INDEX IF NOT EXISTS idx_pages_status_slug ON pages (status, slug) WHERE status = 'published';

-- 8. Create index for homepage queries specifically
CREATE INDEX IF NOT EXISTS idx_pages_home_published ON pages (slug, status) WHERE slug = 'home' AND status = 'published';

-- 9. Clean up any potential whitespace issues in existing data
UPDATE pages 
SET body = jsonb_strip_nulls(body)
WHERE body IS NOT NULL;

-- 10. Add comments for future maintenance
COMMENT ON TABLE pages IS 'Content pages with JSONB body field. Supports sections (homepage), content (simple), or blocks (structured) formats. Cache-optimized with validation constraints.';
COMMENT ON COLUMN pages.body IS 'JSONB content structure. Homepage: {sections: [{type, id, data}]}, Simple: {content: "..."}, Structured: {blocks: [{type, data}]}. Validated to prevent cache/hydration issues.';