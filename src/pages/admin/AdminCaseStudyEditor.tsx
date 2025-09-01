import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingListSkeleton } from '@/components/admin/LoadingSkeleton';
import { SEOEditor } from '@/components/admin/SEOEditor';
// Remove the GalleryManager import since we're not using it
// import { GalleryManager } from '@/components/admin/GalleryManager';
import { TagInput } from '@/components/admin/TagInput';
import { generateSlug, ensureUniqueSlug, formatDate, getStatusBadgeVariant } from '@/lib/admin-utils';
import { adminToast } from '@/lib/toast-utils';
import { SEOHead } from '@/lib/seo';
import { ArrowLeft, ExternalLink, Save, Eye, Plus, X } from 'lucide-react';

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  summary: string;
  client: string;
  industry: string;
  services: string[];
  tech_stack: string[];
  hero_image: string;
  gallery: string[];
  body: string;
  metrics: any;
  status: string;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function AdminCaseStudyEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEditor } = useAuth();
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditing = id !== 'new';

  useEffect(() => {
    if (isEditing) {
      fetchCaseStudy();
    } else {
      setCaseStudy({
        id: '',
        slug: '',
        title: '',
        summary: '',
        client: '',
        industry: '',
        services: [],
        tech_stack: [],
        hero_image: '',
        gallery: [],
        body: '',
        metrics: [],
        status: 'draft',
        published_at: null,
        created_by: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
    }
  }, [id, user, isEditing]);

  const fetchCaseStudy = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCaseStudy(data);
    } catch (error) {
      console.error('Error fetching case study:', error);
      adminToast.error('Failed to load case study');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!caseStudy) return;

    let newSlug = caseStudy.slug;
    if (!isEditing || !caseStudy.slug) {
      newSlug = await ensureUniqueSlug('case_studies', generateSlug(newTitle));
    }

    setCaseStudy({
      ...caseStudy,
      title: newTitle,
      slug: newSlug
    });
  };

  const handleSave = async () => {
    if (!caseStudy || !caseStudy.title.trim()) {
      adminToast.validationError('Title is required');
      return;
    }

    setSaving(true);
    try {
      const slug = await ensureUniqueSlug('case_studies', caseStudy.slug || generateSlug(caseStudy.title), isEditing ? caseStudy.id : undefined);
      const publishedAt = caseStudy.status === 'published' && !caseStudy.published_at ? new Date().toISOString() : caseStudy.published_at;

      const caseStudyData = {
        ...caseStudy,
        slug,
        published_at: publishedAt,
        created_by: caseStudy.created_by || user?.id
      };

      let savedCaseStudy;
      if (isEditing) {
        const { data, error } = await supabase
          .from('case_studies')
          .update(caseStudyData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        savedCaseStudy = data;
        adminToast.updated('Case Study');
      } else {
        const { data, error } = await supabase
          .from('case_studies')
          .insert(caseStudyData)
          .select()
          .single();

        if (error) throw error;
        savedCaseStudy = data;
        adminToast.created('Case Study');
        navigate(`/admin/case-studies/${savedCaseStudy.id}/edit`);
      }

      setCaseStudy(savedCaseStudy);
    } catch (error) {
      console.error('Error saving case study:', error);
      adminToast.error('Failed to save case study');
    } finally {
      setSaving(false);
    }
  };

  if (!isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingListSkeleton />
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Study Not Found</h2>
          <p className="text-gray-600">The requested case study could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${isEditing ? 'Edit' : 'Create'} Case Study - Admin`}
        description="Create and edit case studies"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/case-studies')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Case Studies
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Case Study' : 'Create Case Study'}
              </h1>
              {isEditing && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {formatDate(caseStudy.updated_at)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {caseStudy.status === 'published' && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <a href={`/case-studies/${caseStudy.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                  Preview
                </a>
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={caseStudy.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter case study title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <Input
                    value={caseStudy.slug}
                    onChange={(e) => setCaseStudy({ ...caseStudy, slug: e.target.value })}
                    placeholder="case-study-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Summary</label>
                  <Textarea
                    value={caseStudy.summary}
                    onChange={(e) => setCaseStudy({ ...caseStudy, summary: e.target.value })}
                    placeholder="Brief summary of the case study"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Client</label>
                    <Input
                      value={caseStudy.client}
                      onChange={(e) => setCaseStudy({ ...caseStudy, client: e.target.value })}
                      placeholder="Client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <Input
                      value={caseStudy.industry}
                      onChange={(e) => setCaseStudy({ ...caseStudy, industry: e.target.value })}
                      placeholder="Industry"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services & Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle>Services & Technology</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Services</label>
                  <TagInput
                    tags={caseStudy.services}
                    onTagsChange={(services) => setCaseStudy({ ...caseStudy, services })}
                    placeholder="Add service (press Enter)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tech Stack</label>
                  <TagInput
                    tags={caseStudy.tech_stack}
                    onTagsChange={(tech_stack) => setCaseStudy({ ...caseStudy, tech_stack })}
                    placeholder="Add technology (press Enter)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2">Body Content</label>
                  <Textarea
                    value={caseStudy.body}
                    onChange={(e) => setCaseStudy({ ...caseStudy, body: e.target.value })}
                    placeholder="Detailed case study content (HTML supported)"
                    rows={12}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    HTML tags are supported. Use h2, h3, p, ul, li tags for structure.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                  <Input
                    value={caseStudy.hero_image}
                    onChange={(e) => setCaseStudy({ ...caseStudy, hero_image: e.target.value })}
                    placeholder="https://example.com/hero-image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gallery Images</label>
                  <div className="space-y-2">
                    {caseStudy.gallery.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const newGallery = [...caseStudy.gallery];
                            newGallery[index] = e.target.value;
                            setCaseStudy({ ...caseStudy, gallery: newGallery });
                          }}
                          placeholder="https://example.com/image.jpg"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newGallery = caseStudy.gallery.filter((_, i) => i !== index);
                            setCaseStudy({ ...caseStudy, gallery: newGallery });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCaseStudy({ ...caseStudy, gallery: [...caseStudy.gallery, ''] });
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Image URL
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={caseStudy.status}
                    onChange={(e) => setCaseStudy({ ...caseStudy, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                {caseStudy.published_at && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Published Date</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(caseStudy.published_at)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge variant={getStatusBadgeVariant(caseStudy.status)}>
                    {caseStudy.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2">Metrics (JSON)</label>
                  <Textarea
                    value={JSON.stringify(caseStudy.metrics, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setCaseStudy({ ...caseStudy, metrics: parsed });
                      } catch {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder='[{"label": "Metric Name", "value": 100, "unit": "%"}]'
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JSON format: {`[{"label": "Metric Name", "value": number, "unit": "string"}]`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}