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
import { generateSlug, ensureUniqueSlug, formatDate, getStatusBadgeVariant, isValidUUID } from '@/lib/admin-utils';
import { adminToast } from '@/lib/toast-utils';
import { SEOHead } from '@/lib/seo';
import { ArrowLeft, ExternalLink, Save, Eye, Plus, X } from 'lucide-react';

interface Job {
  id: string;
  slug: string;
  title: string;
  team: string;
  location: string;
  work_mode: string;
  type: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  apply_url: string;
  email: string;
  status: string;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function AdminCareerEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEditor, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditing = id !== 'new';

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (isEditing && id && isValidUUID(id)) {
      fetchJob();
    } else if (!isEditing) {
      setJob({
        id: '',
        slug: '',
        title: '',
        team: '',
        location: '',
        work_mode: 'Remote',
        type: 'contract',
        description: '',
        responsibilities: [],
        requirements: [],
        benefits: [],
        apply_url: '',
        email: 'careers@devmart.sr',
        status: 'open',
        published_at: null,
        created_by: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
    }
  }, [id, user, isEditing, authLoading]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      adminToast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!job) return;

    let newSlug = job.slug;
    if (!isEditing || !job.slug) {
      newSlug = await ensureUniqueSlug('jobs', generateSlug(newTitle));
    }

    setJob({
      ...job,
      title: newTitle,
      slug: newSlug
    });
  };

  const handleSave = async () => {
    if (!job || !job.title.trim()) {
      adminToast.validationError('Title is required');
      return;
    }

    setSaving(true);
    try {
      const slug = await ensureUniqueSlug('jobs', job.slug || generateSlug(job.title), isEditing ? job.id : undefined);
      const publishedAt = job.status === 'open' && !job.published_at ? new Date().toISOString() : job.published_at;

      const jobData = {
        ...job,
        slug,
        published_at: publishedAt,
        created_by: job.created_by || user?.id
      };

      let savedJob;
      if (isEditing) {
        const { data, error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        savedJob = data;
        adminToast.updated('Job');
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .insert(jobData)
          .select()
          .single();

        if (error) throw error;
        savedJob = data;
        adminToast.created('Job');
        navigate(`/admin/careers/${savedJob.id}/edit`);
      }

      setJob(savedJob);
    } catch (error) {
      console.error('Error saving job:', error);
      adminToast.error('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    if (!job) return;
    setJob({
      ...job,
      [field]: [...job[field], '']
    });
  };

  const updateArrayItem = (field: 'responsibilities' | 'requirements' | 'benefits', index: number, value: string) => {
    if (!job) return;
    const newArray = [...job[field]];
    newArray[index] = value;
    setJob({
      ...job,
      [field]: newArray
    });
  };

  const removeArrayItem = (field: 'responsibilities' | 'requirements' | 'benefits', index: number) => {
    if (!job) return;
    const newArray = job[field].filter((_, i) => i !== index);
    setJob({
      ...job,
      [field]: newArray
    });
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

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingListSkeleton />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600">The requested job could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${isEditing ? 'Edit' : 'Create'} Job - Admin`}
        description="Create and edit job postings"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/careers')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Careers
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Job' : 'Create Job'}
              </h1>
              {isEditing && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {formatDate(job.updated_at)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {job.status === 'open' && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <a href={`/careers/${job.slug}`} target="_blank" rel="noopener noreferrer">
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
                  <label className="block text-sm font-medium mb-2">Job Title *</label>
                  <Input
                    value={job.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter job title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <Input
                    value={job.slug}
                    onChange={(e) => setJob({ ...job, slug: e.target.value })}
                    placeholder="job-slug"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team</label>
                    <Input
                      value={job.team}
                      onChange={(e) => setJob({ ...job, team: e.target.value })}
                      placeholder="Engineering"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input
                      value={job.location}
                      onChange={(e) => setJob({ ...job, location: e.target.value })}
                      placeholder="Remote / San Francisco"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Work Mode</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={job.work_mode}
                      onChange={(e) => setJob({ ...job, work_mode: e.target.value })}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={job.type}
                      onChange={(e) => setJob({ ...job, type: e.target.value })}
                    >
                      <option value="contract">Contract</option>
                      <option value="permanent">Permanent</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={job.description}
                    onChange={(e) => setJob({ ...job, description: e.target.value })}
                    placeholder="Brief job description"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Responsibilities</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('responsibilities')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.responsibilities.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateArrayItem('responsibilities', index, e.target.value)}
                      placeholder="Enter responsibility"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('responsibilities', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {job.responsibilities.length === 0 && (
                  <p className="text-sm text-muted-foreground">No responsibilities added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Requirements</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('requirements')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.requirements.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                      placeholder="Enter requirement"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('requirements', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {job.requirements.length === 0 && (
                  <p className="text-sm text-muted-foreground">No requirements added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Benefits & Compensation</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('benefits')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.benefits.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                      placeholder="Enter benefit"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('benefits', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {job.benefits.length === 0 && (
                  <p className="text-sm text-muted-foreground">No benefits added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle>Job Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={job.status}
                    onChange={(e) => setJob({ ...job, status: e.target.value })}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                {job.published_at && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Published Date</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(job.published_at)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {job.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Apply URL</label>
                  <Input
                    value={job.apply_url}
                    onChange={(e) => setJob({ ...job, apply_url: e.target.value })}
                    placeholder="https://apply.company.com/job-id"
                  />
                  {job.apply_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="mt-2 flex items-center gap-2"
                    >
                      <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Test Apply Link
                      </a>
                    </Button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <Input
                    value={job.email}
                    onChange={(e) => setJob({ ...job, email: e.target.value })}
                    placeholder="careers@company.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Job Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(job.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{formatDate(job.updated_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Responsibilities:</span>
                  <span>{job.responsibilities.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requirements:</span>
                  <span>{job.requirements.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Benefits:</span>
                  <span>{job.benefits.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}