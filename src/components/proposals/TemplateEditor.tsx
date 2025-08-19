import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, Save, X } from 'lucide-react';
import { ProposalTemplate, TemplateVariable } from '@/types/proposal';
import { RichEditor } from './RichEditor';

interface TemplateEditorProps {
  template?: ProposalTemplate;
  onSave: (template: Partial<ProposalTemplate>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SERVICE_TYPES = [
  'Web Development',
  'App Development', 
  'Branding & Design',
  'SEO & Marketing',
  'Business Automation',
  'Consulting',
  'Other'
];

const DEFAULT_VARIABLES: TemplateVariable[] = [
  { name: 'client_name', label: 'Client Name', type: 'text', required: true },
  { name: 'client_company', label: 'Client Company', type: 'text' },
  { name: 'total_amount', label: 'Total Amount', type: 'currency' },
  { name: 'expires_at', label: 'Expiration Date', type: 'date' },
  { name: 'sender_name', label: 'Sender Name', type: 'text' },
  { name: 'proposal_link', label: 'Proposal Link', type: 'text' }
];

export function TemplateEditor({ template, onSave, onCancel, isLoading }: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    content: template?.content || '',
    service: template?.variables?.find(v => v.name === 'service_type')?.default_value || '',
    is_active: template?.is_active ?? true,
    variables: template?.variables || DEFAULT_VARIABLES
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    const templateData = {
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      is_active: formData.is_active,
      variables: [
        ...formData.variables,
        { name: 'service_type', label: 'Service Type', type: 'text' as const, default_value: formData.service }
      ]
    };

    await onSave(templateData);
  };

  const insertToken = (token: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + `{{${token}}}`
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {template ? 'Edit Template' : 'Create Template'}
          </h2>
          <p className="text-muted-foreground">
            Create reusable proposal templates with variables and rich content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Basic information about your proposal template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Website Development Proposal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service Type</Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(service => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Proposal for {{client_name}} - {{service_type}}"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="active">Active Template</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
              <CardDescription>
                Click to insert variables into your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map(variable => (
                  <Badge
                    key={variable.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => insertToken(variable.name)}
                  >
                    {variable.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Content</CardTitle>
              <CardDescription>
                Rich content with support for images, formatting, and variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                onInsertToken={insertToken}
              />
            </CardContent>
          </Card>

          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  How this template will appear to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}