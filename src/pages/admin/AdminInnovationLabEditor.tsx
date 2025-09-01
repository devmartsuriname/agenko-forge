import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/admin/LoadingSkeleton';
import { TagInput } from '@/components/admin/TagInput';
import { generateSlug, ensureUniqueSlug, formatDate, getStatusBadgeVariant } from '@/lib/admin-utils';
import { adminToast } from '@/lib/toast-utils';
import { SEOHead } from '@/lib/seo';
import { ArrowLeft, ExternalLink, Save, Eye, Github } from 'lucide-react';

interface LabProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  demo_url: string;
  repo_url: string;
  hero_image: string;
  tags: string[];
  body: string;
  status: string;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function AdminInnovationLabEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEditor } = useAuth();
  const [project, setProject] = useState<LabProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditing = id !== 'new';

  useEffect(() => {
    if (isEditing) {
      fetchProject();
    } else {
      setProject({
        id: '',
        slug: '',
        title: '',
        summary: '',
        demo_url: '',
        repo_url: '',
        hero_image: '',
        tags: [],
        body: '',
        status: 'draft',
        published_at: null,
        created_by: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
    }
  }, [id, user, isEditing]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching lab project:', error);
      adminToast.error('Failed to load lab project');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!project) return;

    let newSlug = project.slug;
    if (!isEditing || !project.slug) {
      newSlug = await ensureUniqueSlug('lab_projects', generateSlug(newTitle));
    }

    setProject({
      ...project,
      title: newTitle,
      slug: newSlug
    });
  };

  const handleSave = async () => {
    if (!project || !project.title.trim()) {
      adminToast.validationError('Title is required');
      return;
    }

    setSaving(true);
    try {
      const slug = await ensureUniqueSlug('lab_projects', project.slug || generateSlug(project.title), isEditing ? project.id : undefined);
      const publishedAt = project.status === 'published' && !project.published_at ? new Date().toISOString() : project.published_at;

      const projectData = {
        ...project,
        slug,
        published_at: publishedAt,
        created_by: project.created_by || user?.id
      };

      let savedProject;
      if (isEditing) {
        const { data, error } = await supabase
          .from('lab_projects')
          .update(projectData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        savedProject = data;
        adminToast.updated('Lab Project');
      } else {
        const { data, error } = await supabase
          .from('lab_projects')
          .insert(projectData)
          .select()
          .single();

        if (error) throw error;
        savedProject = data;
        adminToast.created('Lab Project');
        navigate(`/admin/innovation-lab/${savedProject.id}/edit`);
      }

      setProject(savedProject);
    } catch (error) {
      console.error('Error saving lab project:', error);
      adminToast.error('Failed to save lab project');
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
        <LoadingSkeleton />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lab Project Not Found</h2>
          <p className="text-gray-600">The requested lab project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${isEditing ? 'Edit' : 'Create'} Lab Project - Admin`}
        description="Create and edit innovation lab projects"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/innovation-lab')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Innovation Lab
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Lab Project' : 'Create Lab Project'}
              </h1>
              {isEditing && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {formatDate(project.updated_at)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {project.status === 'published' && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <a href={`/innovation-lab/${project.slug}`} target="_blank" rel="noopener noreferrer">
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
                    value={project.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <Input
                    value={project.slug}
                    onChange={(e) => setProject({ ...project, slug: e.target.value })}
                    placeholder="project-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Summary</label>
                  <Textarea
                    value={project.summary}
                    onChange={(e) => setProject({ ...project, summary: e.target.value })}
                    placeholder="Brief summary of the project"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Demo URL</label>
                    <Input
                      value={project.demo_url}
                      onChange={(e) => setProject({ ...project, demo_url: e.target.value })}
                      placeholder="https://demo.example.com"
                    />
                    {project.demo_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="mt-2 flex items-center gap-2"
                      >
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Test Demo
                        </a>
                      </Button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Repository URL</label>
                    <Input
                      value={project.repo_url}
                      onChange={(e) => setProject({ ...project, repo_url: e.target.value })}
                      placeholder="https://github.com/username/project"
                    />
                    {project.repo_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="mt-2 flex items-center gap-2"
                      >
                        <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                          View Code
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technology & Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Technology & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <TagInput
                    value={project.tags}
                    onChange={(tags) => setProject({ ...project, tags })}
                    placeholder="Add tag (press Enter)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Add relevant technology tags (e.g., React, AI/ML, Blockchain)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                  <Input
                    value={project.hero_image}
                    onChange={(e) => setProject({ ...project, hero_image: e.target.value })}
                    placeholder="https://example.com/hero-image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2">Body Content</label>
                  <Textarea
                    value={project.body}
                    onChange={(e) => setProject({ ...project, body: e.target.value })}
                    placeholder="Detailed project description (HTML supported)"
                    rows={12}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    HTML tags are supported. Use h2, h3, p, ul, li tags for structure.
                  </p>
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
                    value={project.status}
                    onChange={(e) => setProject({ ...project, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                {project.published_at && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Published Date</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(project.published_at)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge variant={getStatusBadgeVariant(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Links Preview */}
            {(project.demo_url || project.repo_url) && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.demo_url && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Demo</label>
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {project.demo_url}
                      </a>
                    </div>
                  )}
                  {project.repo_url && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Repository</label>
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <Github className="h-3 w-3" />
                        {project.repo_url}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Project Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(project.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{formatDate(project.updated_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tags:</span>
                  <span>{project.tags.length} tags</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}