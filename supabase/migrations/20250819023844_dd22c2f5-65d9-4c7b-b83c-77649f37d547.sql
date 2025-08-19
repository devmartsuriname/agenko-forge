-- Phase 7: Settings-driven Payments & Proposals with Templates (Final)
-- Restore point: Devmart-RP-P7-20241219

-- 1. Create proposal_attachments table
CREATE TABLE IF NOT EXISTS public.proposal_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for proposal_attachments
ALTER TABLE public.proposal_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for proposal_attachments
CREATE POLICY "read_own_proposals_attachments" ON public.proposal_attachments
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.proposals p 
    WHERE p.id = proposal_id AND p.created_by = auth.uid()
  ));

CREATE POLICY "admin_all_attachments" ON public.proposal_attachments 
  FOR ALL 
  USING (get_current_user_role() = 'admin');

CREATE POLICY "editors_manage_own_attachments" ON public.proposal_attachments
  FOR ALL
  USING (
    get_current_user_role() = ANY(ARRAY['admin', 'editor']) AND
    EXISTS (
      SELECT 1 FROM public.proposals p 
      WHERE p.id = proposal_id AND p.created_by = auth.uid()
    )
  );

-- 2. Create clients table for basic CRM
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients
CREATE POLICY "admins_all_clients" ON public.clients
  FOR ALL
  USING (get_current_user_role() = 'admin');

CREATE POLICY "editors_manage_clients" ON public.clients
  FOR ALL
  USING (get_current_user_role() = ANY(ARRAY['admin', 'editor']));

-- 3. Add default app_config entries for payments and proposals if they don't exist
INSERT INTO public.app_config (key, value) VALUES 
  ('payments', '{"stripe":{"mode":"test"},"bank_transfer":{"enabled":false,"instructions_md":""},"provider_order":["stripe","bank_transfer"]}'),
  ('proposals', '{"branding":{"primary_color":"#6366f1"},"email":{"from_name":"","from_email":"","bcc_me":false},"tokens":{"ttl_hours":168,"single_use":false},"attachments":{"enabled":true,"max_mb":10}}')
ON CONFLICT (key) DO NOTHING;

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_proposal_attachments_proposal_id ON public.proposal_attachments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);

-- 5. Add updated_at trigger for clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();