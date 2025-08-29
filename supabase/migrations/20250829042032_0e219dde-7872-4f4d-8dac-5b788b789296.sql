-- Add client_id column to proposals table
ALTER TABLE public.proposals 
ADD COLUMN client_id UUID NULL;

-- Add foreign key constraint to clients table
ALTER TABLE public.proposals 
ADD CONSTRAINT proposals_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES public.clients(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- Update RLS policies for proposals to handle client ownership
-- Drop existing policies first
DROP POLICY IF EXISTS "Editors can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Editors can update their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Editors can view and create proposals" ON public.proposals;

-- Recreate policies with client ownership checks
CREATE POLICY "Editors can create proposals" 
ON public.proposals 
FOR INSERT 
TO authenticated
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text])
  AND (
    client_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.clients 
      WHERE id = client_id 
      AND (
        get_current_user_role() = 'admin'::text 
        OR created_by = auth.uid()
      )
    )
  )
);

CREATE POLICY "Editors can update their own proposals" 
ON public.proposals 
FOR UPDATE 
TO authenticated
USING (
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text])) 
  AND (
    get_current_user_role() = 'admin'::text 
    OR created_by = auth.uid()
  )
  AND (
    client_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.clients 
      WHERE id = client_id 
      AND (
        get_current_user_role() = 'admin'::text 
        OR created_by = auth.uid()
      )
    )
  )
);

CREATE POLICY "Editors can view and create proposals" 
ON public.proposals 
FOR SELECT 
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['admin'::text, 'editor'::text])
  AND (
    get_current_user_role() = 'admin'::text 
    OR created_by = auth.uid()
    OR (
      client_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.clients 
        WHERE id = client_id 
        AND created_by = auth.uid()
      )
    )
  )
);