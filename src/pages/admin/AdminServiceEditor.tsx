import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { adminCms } from '@/lib/admin-cms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminErrorBoundary } from '@/components/admin/ErrorBoundary';
import { LoadingCardSkeleton } from '@/components/admin/LoadingSkeleton';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { SEOEditor, SEOData } from '@/components/admin/SEOEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminToast } from '@/lib/toast-utils';
import { isValidUUID } from '@/lib/admin-utils';
import { Helmet } from 'react-helmet-async';
import type { Service } from '@/types/content';

function AdminServiceEditorContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [service, setService] = useState<Partial<Service>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft'
  });

  useEffect(() => {
    if (id && id !== 'new' && isValidUUID(id)) {
      fetchService();
    } else if (id === 'new') {
      setLoading(false);
    }
  }, [id]);

  const fetchService = async () => {
    if (!id) return;
    
    try {
      const data = await adminCms.getService(id);
      if (data) {
        setService(data);
      } else {
        adminToast.error('Service not found');
        navigate('/admin/services');
      }
    } catch (error: any) {
      console.error('Error fetching service:', error);
      adminToast.error('Failed to load service', error.message);
      navigate('/admin/services');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setService(prev => ({
      ...prev,
      title: value,
      slug: !id ? generateSlug(value) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const serviceData = {
        ...service,
        slug: service.slug || generateSlug(service.title || '')
      };

      if (id) {
        await adminCms.updateService(id, serviceData);
        adminToast.updated('Service');
      } else {
        await adminCms.createService(serviceData as Omit<Service, 'id' | 'created_at' | 'updated_at'>);
        adminToast.created('Service');
      }

      navigate('/admin/services');
    } catch (error: any) {
      console.error('Error saving service:', error);
      adminToast.error('Failed to save service', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);

    try {
      await adminCms.deleteService(id);
      adminToast.deleted('Service');
      navigate('/admin/services');
    } catch (error: any) {
      console.error('Error deleting service:', error);
      adminToast.error('Failed to delete service', error.message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Check permissions
  if (!userRole || !['admin', 'editor'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to edit services.</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching service data
  if (loading) {
    return <LoadingCardSkeleton />;
  }

  return (
    <>
      <Helmet>
        <title>{id ? `Edit Service - ${service.title}` : 'Create Service'} | Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/services')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Services</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-2xl font-bold">
              {id ? 'Edit Service' : 'Create Service'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {id && userRole === 'admin' && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                Delete
              </Button>
            )}
            <Button
              type="submit"
              form="service-form"
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Service'}</span>
            </Button>
          </div>
        </div>

        {/* Service Form */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Configure the service information and content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    value={service.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter service title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={service.slug || ''}
                    onChange={(e) => setService(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Will be used in URLs: /services/{service.slug || 'your-slug'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={service.status}
                  onValueChange={(value) => setService(prev => ({ ...prev, status: value as 'draft' | 'published' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content */}
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="excerpt">Service Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={service.excerpt || ''}
                  onChange={(e) => setService(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the service for listings and previews"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  This short description will appear in service listings and search results.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Service Content</Label>
                <Textarea
                  id="content"
                  value={service.content || ''}
                  onChange={(e) => setService(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Detailed service description and information"
                  rows={10}
                />
                <p className="text-sm text-muted-foreground">
                  Full description of the service with all details and features.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Service"
          description={`Are you sure you want to delete "${service.title}"? This action cannot be undone.`}
          confirmLabel="Delete Service"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={handleDelete}
          loading={deleting}
        />
      </div>
    </>
  );
}

export function AdminServiceEditor() {
  return (
    <AdminErrorBoundary>
      <AdminServiceEditorContent />
    </AdminErrorBoundary>
  );
}

export default AdminServiceEditor;