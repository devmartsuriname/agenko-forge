import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { Project, ProjectImage } from '@/types/content';
import { useAuth } from '@/lib/auth';
import { generateSlug, ensureUniqueSlug } from '@/lib/admin-utils';
import { adminToast } from '@/lib/toast-utils';
import { LoadingCardSkeleton } from '@/components/admin/LoadingSkeleton';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { SEOEditor, SEOData } from '@/components/admin/SEOEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye } from 'lucide-react';

function AdminProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditor } = useAuth();
  const isEditing = Boolean(id);

  const [project, setProject] = useState<Partial<Project>>({
    title: '',
    slug: '',
    excerpt: '',
    body: {},
    status: 'draft',
  });
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      const data = await adminCms.getProject(projectId);
      setProject(data);
      
      const imageData = await adminCms.getProjectImages(projectId);
      setImages(imageData);
    } catch (error) {
      console.error('Error fetching project:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        adminToast.permissionDenied('view projects');
      } else {
        adminToast.error('Failed to Load', 'Unable to load project');
      }
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = async (title: string) => {
    setProject(prev => ({ ...prev, title }));
    
    if (!isEditing && title.trim()) {
      const baseSlug = generateSlug(title);
      const uniqueSlug = await ensureUniqueSlug('projects', baseSlug);
      setProject(prev => ({ ...prev, slug: uniqueSlug }));
    }
  };

  const handleSave = async () => {
    if (!project.title?.trim()) {
      adminToast.validationError('Project title is required');
      return;
    }

    setSaving(true);
    try {
      const slug = await ensureUniqueSlug('projects', generateSlug(project.title), isEditing ? project.id : undefined);
      const projectData = {
        title: project.title!,
        slug,
        excerpt: project.excerpt || '',
        body: project.body || {},
        status: project.status!,
        published_at: project.status === 'published' && !project.published_at ? new Date().toISOString() : project.published_at,
      };

      if (isEditing) {
        await adminCms.updateProject(project.id!, projectData);
        adminToast.updated('Project', project.title);
      } else {
        const newProject = await adminCms.createProject(projectData);
        adminToast.created('Project', project.title);
        navigate(`/admin/projects/${newProject.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        adminToast.permissionDenied('save projects');
      } else {
        adminToast.error('Failed to Save', 'Unable to save project. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isEditor) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to edit projects.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead 
          title={`${isEditing ? 'Edit' : 'Create'} Project - Admin Panel`}
          description="Project editor"
        />
        <meta name="robots" content="noindex,nofollow" />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/admin/projects')} disabled>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <Button disabled>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          <LoadingCardSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${isEditing ? 'Edit' : 'Create'} Project - Admin Panel`}
        description="Project editor"
      />
      <meta name="robots" content="noindex,nofollow" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditing ? 'Edit Project' : 'New Project'}
              </h1>
              {project.slug && (
                <p className="text-muted-foreground">/portfolio/{project.slug}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {project.status === 'published' && project.slug && (
              <Button variant="outline" asChild>
                <a href={`/portfolio/${project.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </a>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Basic information about your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="project-title">Title *</Label>
                  <Input
                    id="project-title"
                    placeholder="Enter project title"
                    value={project.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    disabled={saving}
                    aria-describedby="title-help"
                    required
                  />
                  <p id="title-help" className="text-sm text-muted-foreground mt-1">
                    A clear, descriptive title for your project
                  </p>
                </div>

                <div>
                  <Label htmlFor="project-slug">URL Slug</Label>
                  <Input
                    id="project-slug"
                    placeholder="project-slug"
                    value={project.slug || ''}
                    onChange={(e) => setProject(prev => ({ ...prev, slug: e.target.value }))}
                    disabled={saving}
                    aria-describedby="slug-help"
                  />
                  <p id="slug-help" className="text-sm text-muted-foreground mt-1">
                    Auto-generated from title, or customize manually
                  </p>
                </div>

                <div>
                  <Label htmlFor="project-excerpt">Excerpt</Label>
                  <Textarea
                    id="project-excerpt"
                    placeholder="Brief description of the project"
                    value={project.excerpt || ''}
                    onChange={(e) => setProject(prev => ({ ...prev, excerpt: e.target.value }))}
                    disabled={saving}
                    rows={3}
                    aria-describedby="excerpt-help"
                  />
                  <p id="excerpt-help" className="text-sm text-muted-foreground mt-1">
                    A short summary for project listings
                  </p>
                </div>

                <div>
                  <Label htmlFor="project-content">Content</Label>
                  <Textarea
                    id="project-content"
                    value={typeof project.body === 'object' ? JSON.stringify(project.body, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value || '{}');
                        setProject(prev => ({ ...prev, body: parsed }));
                      } catch {
                        // Invalid JSON, keep as is for now
                      }
                    }}
                    placeholder="Project content (JSON format)"
                    rows={15}
                    className="font-mono text-sm"
                    disabled={saving}
                    aria-describedby="content-help"
                  />
                  <p id="content-help" className="text-sm text-muted-foreground mt-1">
                    Rich content in JSON format (future rich text editor)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gallery Management */}
            {isEditing && id && (
              <GalleryManager
                projectId={id}
                images={images}
                onImagesChange={setImages}
                disabled={saving}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
                <CardDescription>Control project visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="project-status">Status</Label>
                  <Select value={project.status} onValueChange={(value) => setProject(prev => ({ ...prev, status: value as 'draft' | 'published' }))}>
                    <SelectTrigger id="project-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Status</span>
                    <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  {project.published_at && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Published {new Date(project.published_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminProjectEditor;
