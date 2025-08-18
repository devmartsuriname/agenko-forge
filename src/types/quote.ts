export interface Quote {
  id: string;
  user_id?: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  service_type: string;
  project_scope: string;
  budget_range: string;
  timeline: string;
  additional_requirements?: string;
  status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  admin_notes?: string;
  assigned_to?: string;
  estimated_cost?: number; // in cents
  quote_expires_at?: string;
  quoted_at?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteActivity {
  id: string;
  quote_id: string;
  user_id?: string;
  activity_type: 'created' | 'status_changed' | 'note_added' | 'assigned' | 'quoted';
  old_value?: string;
  new_value?: string;
  notes?: string;
  created_at: string;
}

export interface QuoteFormData {
  // Step 1: Contact Information
  name: string;
  email: string;
  company?: string;
  phone?: string;
  
  // Step 2: Service Details
  serviceType: string;
  projectScope: string;
  
  // Step 3: Budget & Timeline
  budgetRange: string;
  timeline: string;
  
  // Step 4: Additional Information
  additionalRequirements?: string;
}

export interface QuoteWizardStep {
  id: number;
  title: string;
  description: string;
  fields: string[];
  isValid: (data: Partial<QuoteFormData>) => boolean;
}

export const BUDGET_RANGES = [
  { value: "under-5k", label: "Under $5,000", min: 0, max: 5000 },
  { value: "5k-15k", label: "$5,000 - $15,000", min: 5000, max: 15000 },
  { value: "15k-50k", label: "$15,000 - $50,000", min: 15000, max: 50000 },
  { value: "50k-100k", label: "$50,000 - $100,000", min: 50000, max: 100000 },
  { value: "100k-plus", label: "$100,000+", min: 100000, max: null },
  { value: "not-sure", label: "Not sure / Need consultation", min: null, max: null }
];

export const TIMELINE_OPTIONS = [
  { value: "asap", label: "ASAP (Rush job)" },
  { value: "1-month", label: "Within 1 month" },
  { value: "2-3-months", label: "2-3 months" },
  { value: "3-6-months", label: "3-6 months" },
  { value: "6-plus-months", label: "6+ months" },
  { value: "flexible", label: "Flexible / Ongoing project" }
];

export const SERVICE_TYPES = [
  { value: "web-development", label: "Web Development", icon: "🌐" },
  { value: "mobile-app", label: "Mobile App Development", icon: "📱" },
  { value: "e-commerce", label: "E-commerce Solution", icon: "🛒" },
  { value: "custom-software", label: "Custom Software", icon: "⚙️" },
  { value: "ui-ux-design", label: "UI/UX Design", icon: "🎨" },
  { value: "api-integration", label: "API Integration", icon: "🔗" },
  { value: "maintenance", label: "Maintenance & Support", icon: "🔧" },
  { value: "consulting", label: "Technical Consulting", icon: "💡" },
  { value: "other", label: "Other", icon: "📋" }
];