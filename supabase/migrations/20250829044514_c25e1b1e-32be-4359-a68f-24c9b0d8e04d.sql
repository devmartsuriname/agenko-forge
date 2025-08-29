-- Add public_id column to proposals table
ALTER TABLE public.proposals 
ADD COLUMN public_id TEXT UNIQUE;

-- Create function to generate proposal public IDs
CREATE OR REPLACE FUNCTION public.generate_proposal_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_year TEXT;
    sequence_num INTEGER;
    new_id TEXT;
BEGIN
    -- Get current year
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN public_id ~ ('^PR-' || current_year || '-[0-9]+$') 
            THEN CAST(SUBSTRING(public_id FROM LENGTH('PR-' || current_year || '-') + 1) AS INTEGER)
            ELSE 0 
        END
    ), 0) + 1
    INTO sequence_num
    FROM public.proposals 
    WHERE public_id IS NOT NULL;
    
    -- Format the ID: PR-2025-0001
    new_id := 'PR-' || current_year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_id;
END;
$$;

-- Create trigger to auto-generate public_id on insert
CREATE OR REPLACE FUNCTION public.set_proposal_public_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.public_id IS NULL THEN
        NEW.public_id := public.generate_proposal_id();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_proposal_public_id
    BEFORE INSERT ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION public.set_proposal_public_id();

-- Update existing proposals to have public_ids
UPDATE public.proposals 
SET public_id = public.generate_proposal_id()
WHERE public_id IS NULL;

-- Make public_id NOT NULL after setting values
ALTER TABLE public.proposals 
ALTER COLUMN public_id SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_proposals_public_id ON public.proposals(public_id);