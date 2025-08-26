import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateEditor } from '@/components/proposals/TemplateEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { adminToast } from '@/lib/toast-utils';
import { 
  Plus, 
  Send, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Copy,
  Archive,
  Filter,
  Search,
  FileDown
} from 'lucide-react';
import { Proposal, ProposalTemplate, CreateProposalData, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from '@/types/proposal';
import { 
  SERVICE_TYPES, 
  TEMPLATE_STATUS_OPTIONS, 
  TEMPLATE_STATUS_COLORS,
  duplicateTemplate,
  toggleTemplateArchive, 
  exportTemplateAsJSON,
  logTemplateOperation
} from '@/lib/proposal-helpers';

export default function AdminProposals() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('proposals');
  
  // Template filters
  const [templateFilters, setTemplateFilters] = useState({
    search: '',
    service: '',
    status: ''
  });

  // Form states
  const [proposalForm, setProposalForm] = useState<CreateProposalData>({
    title: '',
    subject: '',
    content: '',
    recipients: [{ email: '', name: '', role: 'primary' }],
    currency: 'usd'
  });

  useEffect(() => {
    fetchProposals();
    fetchTemplates();
    
    // Handle URL parameters from client navigation
    const clientName = searchParams.get('clientName');
    const clientEmail = searchParams.get('clientEmail');
    const clientCompany = searchParams.get('clientCompany');
    const fromClients = searchParams.get('fromClients');
    const tab = searchParams.get('tab');
    const action = searchParams.get('action');

    if (tab) {
      setActiveTab(tab);
    }

    if (fromClients === 'true' && action === 'create' && clientName && clientEmail) {
      // Prefill proposal form with client data
      setProposalForm(prev => ({
        ...prev,
        title: `Proposal for ${clientName}`,
        subject: `Business Proposal for ${clientCompany || clientName}`,
        recipients: [{
          email: clientEmail,
          name: clientName,
          role: 'primary'
        }]
      }));
      setShowCreateDialog(true);
      
      // Clear URL params after using them
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          proposal_recipients (*),
          quotes (id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data || []) as Proposal[]);
    } catch (error: any) {
      adminToast.error('Failed to load proposals', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []).map(template => ({
        ...template,
        variables: (template.variables as any) || []
      })) as ProposalTemplate[]);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
    }
  };

  const createProposal = async () => {
    try {
      if (!proposalForm.title || !proposalForm.content || !proposalForm.recipients[0].email) {
        adminToast.validationError('Please fill in all required fields');
        return;
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          title: proposalForm.title,
          subject: proposalForm.subject,
          content: proposalForm.content,
          template_id: proposalForm.template_id,
          quote_id: proposalForm.quote_id,
          total_amount: proposalForm.total_amount ? proposalForm.total_amount * 100 : null,
          currency: proposalForm.currency,
          expires_at: proposalForm.expires_at
        })
        .select()
        .single();

      if (error) throw error;

      // Add recipients
      const recipientPromises = proposalForm.recipients.map(recipient => 
        supabase.rpc('generate_proposal_token').then(({ data: token }) =>
          supabase
            .from('proposal_recipients')
            .insert({
              proposal_id: data.id,
              email: recipient.email,
              name: recipient.name,
              role: recipient.role,
              token: token
            })
        )
      );

      await Promise.all(recipientPromises);

      adminToast.created('proposal', proposalForm.title);
      setShowCreateDialog(false);
      setProposalForm({
        title: '',
        subject: '',
        content: '',
        recipients: [{ email: '', name: '', role: 'primary' }],
        currency: 'usd'
      });
      fetchProposals();
    } catch (error: any) {
      adminToast.error('Failed to create proposal', error.message);
    }
  };

  const sendProposal = async (proposalId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-proposal', {
        body: { proposal_id: proposalId }
      });

      if (error) throw error;
      adminToast.success('Proposal sent', data.message);
      fetchProposals();
    } catch (error: any) {
      adminToast.error('Failed to send proposal', error.message);
    }
  };

  const downloadPDF = async (proposalId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-proposal-pdf', {
        body: { proposal_id: proposalId }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${proposalId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      adminToast.success('Proposal downloaded');
    } catch (error: any) {
      adminToast.error('Failed to download proposal', error.message);
    }
  };

  const handleSaveTemplate = async (templateData: Partial<ProposalTemplate>) => {
    try {
      // Convert template data to database format
      const dbData = {
        name: templateData.name,
        subject: templateData.subject,
        content: templateData.content,
        service_type: templateData.service_type || templateData.variables?.find(v => v.name === 'service_type')?.default_value,
        status: templateData.status,
        is_active: templateData.is_active,
        variables: templateData.variables as any // Cast to Json for Supabase
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('proposal_templates')
          .update(dbData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        
        await logTemplateOperation('updated', editingTemplate.id, templateData.name);
        adminToast.updated('template', templateData.name);
      } else {
        const { data, error } = await supabase
          .from('proposal_templates')
          .insert([dbData])
          .select()
          .single();

        if (error) throw error;
        
        await logTemplateOperation('created', data.id, templateData.name);
        adminToast.created('template', templateData.name);
      }

      setShowTemplateEditor(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      adminToast.error('Failed to save template', error.message);
    }
  };

  const handleDuplicateTemplate = async (template: ProposalTemplate) => {
    try {
      await duplicateTemplate(template);
      adminToast.success('Template duplicated', `Created copy of "${template.name}"`);
      fetchTemplates();
    } catch (error: any) {
      adminToast.error('Failed to duplicate template', error.message);
    }
  };

  const handleArchiveTemplate = async (template: ProposalTemplate) => {
    try {
      const currentStatus = template.status || (template.is_active ? 'active' : 'draft');
      await toggleTemplateArchive(template.id, currentStatus);
      
      const isArchiving = currentStatus !== 'archived';
      adminToast.success(
        isArchiving ? 'Template archived' : 'Template unarchived', 
        `"${template.name}" has been ${isArchiving ? 'archived' : 'restored'}`
      );
      fetchTemplates();
    } catch (error: any) {
      adminToast.error('Failed to update template', error.message);
    }
  };

  const handleExportTemplate = (template: ProposalTemplate) => {
    exportTemplateAsJSON(template);
    adminToast.exported('template', `${template.name}.json`);
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !templateFilters.search || 
      template.name.toLowerCase().includes(templateFilters.search.toLowerCase()) ||
      template.subject.toLowerCase().includes(templateFilters.search.toLowerCase());
    
    const serviceType = template.service_type || template.variables?.find(v => v.name === 'service_type')?.default_value;
    const matchesService = !templateFilters.service || serviceType === templateFilters.service;
    
    const status = template.status || (template.is_active ? 'active' : 'draft');
    const matchesStatus = !templateFilters.status || status === templateFilters.status;
    
    return matchesSearch && matchesService && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading proposals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground">Manage proposal templates and send proposals to clients</p>
        </div>
        <Button
          onClick={() => {
            setEditingTemplate(null);
            setShowTemplateEditor(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-bold">{proposals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">
                  {proposals.filter(p => ['sent', 'viewed', 'accepted'].includes(p.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">
                  {proposals.filter(p => p.status === 'accepted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ${proposals
                    .filter(p => p.status === 'accepted' && p.total_amount)
                    .reduce((sum, p) => sum + (p.total_amount || 0), 0) / 100}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Proposals</h2>
            <Button
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </div>

          {/* Proposals Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{proposal.title}</div>
                          <div className="text-sm text-muted-foreground">{proposal.subject}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={PROPOSAL_STATUS_COLORS[proposal.status]}>
                          {PROPOSAL_STATUS_LABELS[proposal.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {proposal.proposal_recipients?.length || 0} recipients
                      </TableCell>
                      <TableCell>
                        {proposal.total_amount ? formatCurrency(proposal.total_amount, proposal.currency) : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedProposal(proposal)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {proposal.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendProposal(proposal.id)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadPDF(proposal.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {proposals.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No proposals yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by creating your first proposal.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Template Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={templateFilters.search}
                    onChange={(e) => setTemplateFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-64"
                  />
                </div>
                <Select
                  value={templateFilters.service}
                  onValueChange={(value) => setTemplateFilters(prev => ({ 
                    ...prev, 
                    service: value === 'all' ? '' : value 
                  }))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {SERVICE_TYPES.map(service => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={templateFilters.status}
                  onValueChange={(value) => setTemplateFilters(prev => ({ 
                    ...prev, 
                    status: value === 'all' ? '' : value 
                  }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {TEMPLATE_STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Templates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => {
                    const serviceType = template.service_type || template.variables?.find(v => v.name === 'service_type')?.default_value;
                    const status = template.status || (template.is_active ? 'active' : 'draft');
                    
                    return (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">{template.subject}</div>
                          </div>
                        </TableCell>
                        <TableCell>{serviceType || '-'}</TableCell>
                        <TableCell>
                          <Badge className={TEMPLATE_STATUS_COLORS[status]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(template.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTemplate(template)}
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTemplate(template);
                                setShowTemplateEditor(true);
                              }}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDuplicateTemplate(template)}
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleArchiveTemplate(template)}
                              title={status === 'archived' ? 'Unarchive' : 'Archive'}
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportTemplate(template)}
                              title="Export JSON"
                            >
                              <FileDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No templates found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first template to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog */}
      {showTemplateEditor && (
        <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1">
              <TemplateEditor
                template={editingTemplate}
                onSave={handleSaveTemplate}
                onCancel={() => setShowTemplateEditor(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Proposal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Proposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Website Development Proposal"
                />
              </div>
              <div>
                <Label>Subject *</Label>
                <Input
                  value={proposalForm.subject}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Your Website Development Proposal"
                />
              </div>
            </div>

            <div>
              <Label>Content *</Label>
              <Textarea
                value={proposalForm.content}
                onChange={(e) => setProposalForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter the proposal content..."
                rows={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Amount</Label>
                <Input
                  type="number"
                  value={proposalForm.total_amount || ''}
                  onChange={(e) => setProposalForm(prev => ({ 
                    ...prev, 
                    total_amount: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label>Expires At</Label>
                <Input
                  type="date"
                  value={proposalForm.expires_at || ''}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Recipients *</Label>
              {proposalForm.recipients.map((recipient, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 mt-2">
                  <Input
                    placeholder="Email"
                    value={recipient.email}
                    onChange={(e) => {
                      const newRecipients = [...proposalForm.recipients];
                      newRecipients[index].email = e.target.value;
                      setProposalForm(prev => ({ ...prev, recipients: newRecipients }));
                    }}
                  />
                  <Input
                    placeholder="Name"
                    value={recipient.name}
                    onChange={(e) => {
                      const newRecipients = [...proposalForm.recipients];
                      newRecipients[index].name = e.target.value;
                      setProposalForm(prev => ({ ...prev, recipients: newRecipients }));
                    }}
                  />
                  <Select
                    value={recipient.role}
                    onValueChange={(value: any) => {
                      const newRecipients = [...proposalForm.recipients];
                      newRecipients[index].role = value;
                      setProposalForm(prev => ({ ...prev, recipients: newRecipients }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="cc">CC</SelectItem>
                      <SelectItem value="approver">Approver</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (proposalForm.recipients.length > 1) {
                        const newRecipients = proposalForm.recipients.filter((_, i) => i !== index);
                        setProposalForm(prev => ({ ...prev, recipients: newRecipients }));
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setProposalForm(prev => ({
                  ...prev,
                  recipients: [...prev.recipients, { email: '', name: '', role: 'primary' }]
                }))}
              >
                Add Recipient
              </Button>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createProposal}>
                Create Proposal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <p className="text-sm text-muted-foreground">{selectedTemplate.subject}</p>
              </div>
              
              <div>
                <Label>Content</Label>
                <div className="p-4 border rounded-md bg-muted/50 prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
                </div>
              </div>
              
              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div>
                  <Label>Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTemplate.variables.map(variable => (
                      <Badge key={variable.name} variant="outline">
                        {variable.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Proposal Detail Dialog */}
      {selectedProposal && (
        <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProposal.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={PROPOSAL_STATUS_COLORS[selectedProposal.status]}>
                    {PROPOSAL_STATUS_LABELS[selectedProposal.status]}
                  </Badge>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p>{selectedProposal.total_amount ? formatCurrency(selectedProposal.total_amount, selectedProposal.currency) : 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <Label>Content</Label>
                <div className="p-4 border rounded-md bg-muted/50">
                  <div dangerouslySetInnerHTML={{ __html: selectedProposal.content }} />
                </div>
              </div>

              <div>
                <Label>Recipients</Label>
                <div className="space-y-2">
                  {selectedProposal.proposal_recipients?.map((recipient, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">{recipient.name || recipient.email}</span>
                        <span className="text-sm text-muted-foreground ml-2">({recipient.role})</span>
                      </div>
                      {recipient.viewed_at && (
                        <span className="text-sm text-green-600">
                          Viewed {new Date(recipient.viewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}