import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Filter, Eye, Edit, MessageSquare, UserCheck, Calendar, DollarSign, Download, MoreHorizontal, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Quote, QuoteActivity } from '@/types/quote';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/csv-export';
import { EventLogDrawer } from '@/components/admin/EventLogDrawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface QuoteWithActivities extends Quote {
  activities?: QuoteActivity[];
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteWithActivities[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithActivities | null>(null);
  const [updating, setUpdating] = useState(false);
  const [eventLogOpen, setEventLogOpen] = useState(false);
  const [eventLogEntityId, setEventLogEntityId] = useState<string>('');
  const [eventLogEntityLabel, setEventLogEntityLabel] = useState<string>('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_activities (*)
        `)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;

      setQuotes((quotesData || []) as QuoteWithActivities[]);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: string, notes?: string) => {
    setUpdating(true);
    try {
      const oldQuote = quotes.find(q => q.id === quoteId);
      
      // Update quote
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString()
      };

      if (status === 'quoted') {
        updateData.quoted_at = new Date().toISOString();
      }

      const { error: quoteError } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      // Create activity log
      const { error: activityError } = await supabase
        .from('quote_activities')
        .insert({
          quote_id: quoteId,
          activity_type: 'status_changed',
          old_value: oldQuote?.status,
          new_value: status,
          notes: notes || `Status changed from ${oldQuote?.status} to ${status}`,
        });

      if (activityError) {
        console.error('Error creating activity log:', activityError);
      }

      toast.success(`Quote status updated to ${status}`);
      fetchQuotes();
      setSelectedQuote(null);
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote status');
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async (quoteId: string, note: string) => {
    try {
      // Update admin notes
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ 
          admin_notes: note,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      // Create activity log
      const { error: activityError } = await supabase
        .from('quote_activities')
        .insert({
          quote_id: quoteId,
          activity_type: 'note_added',
          new_value: note,
          notes: 'Admin note added',
        });

      if (activityError) {
        console.error('Error creating activity log:', activityError);
      }

      toast.success('Note added successfully');
      fetchQuotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || quote.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      reviewed: 'outline',
      quoted: 'default',
      accepted: 'default',
      rejected: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      low: 'outline',
      normal: 'secondary',
      high: 'default',
      urgent: 'destructive'
    };

    return (
      <Badge variant={variants[priority] || 'secondary'}>
        {priority}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleExportCSV = () => {
    try {
      const exportData = filteredQuotes.map(quote => ({
        id: quote.id,
        company: quote.company || '',
        contact_email: quote.email,
        stage: quote.status,
        created_at: new Date(quote.created_at).toISOString(),
        amount: quote.estimated_cost || ''
      }));

      const headers = ['id', 'company', 'contact_email', 'stage', 'created_at', 'amount'];
      const filename = exportToCSV(exportData, 'quotes.csv', { customHeaders: headers });
      toast.success(`Exported ${exportData.length} quotes to ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export quotes');
    }
  };

  const handleViewEvents = (quote: QuoteWithActivities) => {
    setEventLogEntityId(quote.id);
    setEventLogEntityLabel(`Quote ${quote.id.slice(0, 8)}... (${quote.company || quote.email})`);
    setEventLogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quote Management</h1>
        <p className="text-muted-foreground">
          Manage and track customer quote requests
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Quotes ({filteredQuotes.length})</CardTitle>
              <CardDescription>
                Recent quote requests and their status
              </CardDescription>
            </div>
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              disabled={filteredQuotes.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quote.name}</div>
                        <div className="text-sm text-muted-foreground">{quote.email}</div>
                        {quote.company && (
                          <div className="text-xs text-muted-foreground">{quote.company}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {quote.service_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{quote.budget_range.replace('-', ' ')}</div>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(quote.priority)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(quote.status)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(quote.created_at)}
                    </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedQuote(quote)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Quote Details</DialogTitle>
                                <DialogDescription>
                                  Quote ID: {quote.id}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedQuote && selectedQuote.id === quote.id && (
                                <QuoteDetailsDialog 
                                  quote={selectedQuote}
                                  onUpdateStatus={updateQuoteStatus}
                                  onAddNote={addNote}
                                  updating={updating}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Event Log button - visible on md+ screens */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEvents(quote)}
                            className="hidden md:flex"
                            title="View Events"
                          >
                            <Activity className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border shadow-md">
                              <DropdownMenuItem 
                                onClick={() => handleViewEvents(quote)}
                                className="cursor-pointer"
                              >
                                <Activity className="h-4 w-4 mr-2" />
                                View Events
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EventLogDrawer 
        open={eventLogOpen}
        onOpenChange={setEventLogOpen}
        entityType="quotes"
        entityId={eventLogEntityId}
        entityLabel={eventLogEntityLabel}
      />
    </div>
  );
}

interface QuoteDetailsDialogProps {
  quote: QuoteWithActivities;
  onUpdateStatus: (quoteId: string, status: string, notes?: string) => Promise<void>;
  onAddNote: (quoteId: string, note: string) => Promise<void>;
  updating: boolean;
}

function QuoteDetailsDialog({ 
  quote, 
  onUpdateStatus, 
  onAddNote, 
  updating 
}: QuoteDetailsDialogProps) {
  const [newNote, setNewNote] = useState(quote.admin_notes || '');
  const [newStatus, setNewStatus] = useState<Quote['status']>(quote.status);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Quote Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="text-sm font-medium">Customer Name</Label>
          <p className="text-sm">{quote.name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Email</Label>
          <p className="text-sm">{quote.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Company</Label>
          <p className="text-sm">{quote.company || 'Not provided'}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Phone</Label>
          <p className="text-sm">{quote.phone || 'Not provided'}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Service Type</Label>
          <p className="text-sm">{quote.service_type.replace('-', ' ')}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Budget Range</Label>
          <p className="text-sm">{quote.budget_range}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Timeline</Label>
          <p className="text-sm">{quote.timeline}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Priority</Label>
          <Badge variant="outline">{quote.priority}</Badge>
        </div>
      </div>

      {/* Project Scope */}
      <div>
        <Label className="text-sm font-medium">Project Scope</Label>
        <div className="mt-1 p-3 bg-muted/50 rounded text-sm whitespace-pre-wrap">
          {quote.project_scope}
        </div>
      </div>

      {/* Additional Requirements */}
      {quote.additional_requirements && (
        <div>
          <Label className="text-sm font-medium">Additional Requirements</Label>
          <div className="mt-1 p-3 bg-muted/50 rounded text-sm whitespace-pre-wrap">
            {quote.additional_requirements}
          </div>
        </div>
      )}

      {/* Status Management */}
      <div className="border-t pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="status-select">Update Status</Label>
            <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => onUpdateStatus(quote.id, newStatus)}
              disabled={updating || newStatus === quote.status}
              className="w-full"
            >
              Update Status
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      <div>
        <Label htmlFor="admin-notes">Admin Notes</Label>
        <Textarea
          id="admin-notes"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add internal notes about this quote..."
          rows={4}
        />
        <Button
          onClick={() => onAddNote(quote.id, newNote)}
          disabled={updating || newNote === quote.admin_notes}
          className="mt-2"
          size="sm"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Save Notes
        </Button>
      </div>

      {/* Activity History */}
      {quote.activities && quote.activities.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Activity History</Label>
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
            {quote.activities.map((activity) => (
              <div key={activity.id} className="border rounded p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {activity.activity_type.replace('_', ' ')}
                    </Badge>
                    {activity.old_value && activity.new_value && (
                      <p className="mt-1">
                        Changed from <strong>{activity.old_value}</strong> to <strong>{activity.new_value}</strong>
                      </p>
                    )}
                    {activity.notes && (
                      <p className="text-muted-foreground mt-1">{activity.notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}