-- Create email subscriptions table for newsletter system
CREATE TABLE public.email_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT, -- 'newsletter', 'blog', 'exit_intent', 'scroll_cta', etc.
  preferences JSONB DEFAULT '{}',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for email subscriptions
CREATE POLICY "Admins can view all email subscriptions" 
ON public.email_subscriptions 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Service role can insert email subscriptions" 
ON public.email_subscriptions 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update email subscriptions" 
ON public.email_subscriptions 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Create CTA tracking table for analytics
CREATE TABLE public.cta_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  cta_type TEXT NOT NULL, -- 'newsletter', 'exit_intent', 'scroll_progress', 'sticky_bar'
  action TEXT NOT NULL, -- 'shown', 'clicked', 'dismissed', 'converted'
  page_url TEXT NOT NULL,
  element_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cta_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for CTA tracking
CREATE POLICY "Admins can view all CTA interactions" 
ON public.cta_interactions 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Service role can insert CTA interactions" 
ON public.cta_interactions 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_email_subscriptions_updated_at
BEFORE UPDATE ON public.email_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_email_subscriptions_email ON public.email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_status ON public.email_subscriptions(status);
CREATE INDEX idx_email_subscriptions_source ON public.email_subscriptions(source);
CREATE INDEX idx_cta_interactions_type_action ON public.cta_interactions(cta_type, action);
CREATE INDEX idx_cta_interactions_created_at ON public.cta_interactions(created_at);