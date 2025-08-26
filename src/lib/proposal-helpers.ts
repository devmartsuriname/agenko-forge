// Proposal helper functions for templates and logging
import { supabase } from '@/integrations/supabase/client';
import { ProposalTemplate } from '@/types/proposal';

// Service types for proposals
export const SERVICE_TYPES = [
  'Web Development',
  'App Development', 
  'Branding & Design',
  'SEO & Marketing',
  'Business Automation',
  'Consulting',
  'Other'
];

// Template status options
export const TEMPLATE_STATUS_OPTIONS = ['active', 'draft', 'archived'] as const;
export type TemplateStatus = typeof TEMPLATE_STATUS_OPTIONS[number];

// Template status colors for badges
export const TEMPLATE_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', 
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

// Log template operations
export const logTemplateOperation = async (
  action: string, 
  templateId: string, 
  templateName?: string
) => {
  try {
    await supabase.rpc('log_app_event', {
      p_level: 'info',
      p_area: 'proposals-templates',
      p_message: `Template ${action}: ${templateName || templateId}`,
      p_meta: {
        template_id: templateId,
        action: action,
        template_name: templateName
      }
    });
  } catch (error) {
    console.error('Failed to log template operation:', error);
  }
};

// Duplicate template helper
export const duplicateTemplate = async (template: ProposalTemplate) => {
  const duplicatedTemplate = {
    name: `Copy of ${template.name}`,
    subject: template.subject,
    content: template.content,
    service_type: template.variables?.find(v => v.name === 'service_type')?.default_value,
    status: 'draft' as TemplateStatus,
    variables: template.variables as any // Cast to Json for Supabase
  };

  const { data, error } = await supabase
    .from('proposal_templates')
    .insert([duplicatedTemplate])
    .select()
    .single();

  if (error) throw error;

  await logTemplateOperation('duplicated', data.id, duplicatedTemplate.name);
  return data;
};

// Archive/unarchive template
export const toggleTemplateArchive = async (templateId: string, currentStatus: string) => {
  const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
  
  const { error } = await supabase
    .from('proposal_templates')
    .update({ status: newStatus })
    .eq('id', templateId);

  if (error) throw error;

  await logTemplateOperation(
    newStatus === 'archived' ? 'archived' : 'unarchived', 
    templateId
  );
};

// Export template as JSON
export const exportTemplateAsJSON = (template: ProposalTemplate) => {
  const exportData = {
    id: template.id,
    name: template.name,
    service: template.service_type || template.variables?.find(v => v.name === 'service_type')?.default_value || '',
    status: template.status || (template.is_active ? 'active' : 'draft'),
    content: template.content,
    updated_at: template.updated_at
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob(['\ufeff' + jsonString], { 
    type: 'application/json;charset=utf-8' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  logTemplateOperation('exported', template.id, template.name);
};