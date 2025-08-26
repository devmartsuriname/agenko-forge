export interface ProposalTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: TemplateVariable[];
  is_active: boolean;
  status?: 'active' | 'draft' | 'archived';
  service_type?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
  default_value?: string;
  required?: boolean;
  description?: string;
}

export interface Proposal {
  id: string;
  template_id?: string;
  title: string;
  subject: string;
  content: string;
  quote_id?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  sent_at?: string;
  expires_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  total_amount?: number;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  proposal_recipients?: ProposalRecipient[];
  events?: ProposalEvent[];
  quotes?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProposalRecipient {
  id: string;
  proposal_id: string;
  email: string;
  name?: string;
  role: 'primary' | 'cc' | 'approver';
  token: string;
  viewed_at?: string;
  created_at: string;
}

export interface ProposalEvent {
  id: string;
  proposal_id: string;
  event_type: 'created' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  user_email?: string;
  user_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CreateProposalData {
  template_id?: string;
  title: string;
  subject: string;
  content: string;
  quote_id?: string;
  expires_at?: string;
  total_amount?: number;
  currency?: string;
  recipients: {
    email: string;
    name?: string;
    role: 'primary' | 'cc' | 'approver';
  }[];
  variables?: Record<string, any>;
}

export const PROPOSAL_STATUS_LABELS = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired'
};

export const PROPOSAL_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800'
};