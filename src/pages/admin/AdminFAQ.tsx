import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { adminCms } from '@/lib/admin-cms';
import { formatDate, getStatusBadgeVariant } from '@/lib/admin-utils';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import type { FAQ } from '@/types/content';

function AdminFAQ() {
  const { isEditor } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    status: 'published' as 'draft' | 'published',
    sort_order: 0
  });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: () => adminCms.getAllFAQs()
  });

  const createMutation = useMutation({
    mutationFn: (faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => 
      adminCms.createFAQ(faq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      toast.success('FAQ created successfully');
      handleDialogClose();
    },
    onError: (error) => {
      toast.error('Failed to create FAQ: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<FAQ>) =>
      adminCms.updateFAQ(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      toast.success('FAQ updated successfully');
      handleDialogClose();
    },
    onError: (error) => {
      toast.error('Failed to update FAQ: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCms.deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      toast.success('FAQ deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete FAQ: ' + error.message);
    }
  });

  if (!isEditor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need editor permissions to manage FAQs.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    try {
      const faqData = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        status: formData.status,
        sort_order: formData.sort_order || 0
      };

      if (editingFaq) {
        await updateMutation.mutateAsync({
          id: editingFaq.id,
          ...faqData
        });
      } else {
        await createMutation.mutateAsync(faqData);
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      status: faq.status,
      sort_order: faq.sort_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      status: 'published',
      sort_order: 0
    });
  };

  const handleExportCSV = () => {
    if (faqs.length === 0) {
      toast.error('No FAQs to export');
      return;
    }

    const csvData = faqs.map(faq => ({
      Question: faq.question,
      Answer: faq.answer,
      Status: faq.status,
      'Sort Order': faq.sort_order,
      'Created At': faq.created_at,
      'Updated At': faq.updated_at
    }));

    adminCms.exportToCSV(csvData, 'faqs');
    toast.success('FAQs exported successfully');
  };

  return (
    <>
      <div className="p-6 border-b border-border bg-background/95 backdrop-blur">
        <h1 className="text-2xl font-bold text-foreground">FAQ Management</h1>
        <p className="text-muted-foreground mt-1">Manage frequently asked questions</p>
      </div>

      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Manage questions and answers for your FAQ page
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  disabled={faqs.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add FAQ
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingFaq ? 'Update the FAQ details below.' : 'Add a new frequently asked question.'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="question">Question *</Label>
                        <Textarea
                          id="question"
                          value={formData.question}
                          onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                          placeholder="What is your question?"
                          rows={2}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="answer">Answer *</Label>
                        <Textarea
                          id="answer"
                          value={formData.answer}
                          onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                          placeholder="Provide a detailed answer..."
                          rows={4}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(status: 'draft' | 'published') => 
                              setFormData(prev => ({ ...prev, status }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="sort_order">Sort Order</Label>
                          <Input
                            id="sort_order"
                            type="number"
                            value={formData.sort_order}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              sort_order: parseInt(e.target.value) || 0 
                            }))}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDialogClose}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createMutation.isPending || updateMutation.isPending}
                        >
                          {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div>Loading FAQs...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium truncate">{faq.question}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {faq.answer}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(faq.status)}>
                          {faq.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{faq.sort_order}</TableCell>
                      <TableCell>{formatDate(faq.updated_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(faq)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(faq.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default AdminFAQ;