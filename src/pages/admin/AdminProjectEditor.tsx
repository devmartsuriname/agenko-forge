import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { Project, ProjectImage } from '@/lib/cms';
import { useAuth } from '@/lib/auth';
import { generateSlug, ensureUniqueSlug } from '@/lib/admin-utils';
import { ArrowLeft, Save, Eye, Image, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export default function AdminProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditor } = useAuth();
  const { toast } = useToast();
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
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [newImage, setNewImage] = useState({ url: '', alt: '' });

  useEffect(() => {
    if (isEditing && id) {
      fetchProject(id);
      fetchImages(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      const data = await adminCms.getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project',
        variant: 'destructive',
      });
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async (projectId: string) => {
    try {
      const data = await adminCms.getProjectImages(projectId);
      setImages(data);
    } catch (error) {
      console.error('Error fetching project images:', error);
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
      toast({
        title: 'Error',
        description: 'Project title is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const publishedAt = project.status === 'published' && !project.published_at ? now : project.published_at;

      if (isEditing && id) {
        await adminCms.updateProject(id, {
          ...project,
          published_at: publishedAt,
        });
      } else {
        const created = await adminCms.createProject({
          title: project.title!,
          slug: project.slug!,
          excerpt: project.excerpt || null,
          body: project.body || {},
          status: project.status!,
          published_at: publishedAt,
        });
        navigate(`/admin/projects/${created.id}/edit`);
      }

      toast({
        title: 'Success',
        description: `Project ${isEditing ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} project`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImage.url.trim() || !id) return;

    try {
      const nextSortOrder = Math.max(0, ...images.map(img => img.sort_order || 0)) + 1;
      await adminCms.addProjectImage(id, newImage.url, newImage.alt, nextSortOrder);
      await fetchImages(id);
      setNewImage({ url: '', alt: '' });
      setShowImageDialog(false);
      
      toast({
        title: 'Success',
        description: 'Image added successfully',
      });
    } catch (error) {
      console.error('Error adding image:', error);
      toast({
        title: 'Error',
        description: 'Failed to add image',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await adminCms.deleteProjectImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  const handleReorderImage = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    try {
      const newImages = [...images];
      [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];
      
      // Update sort orders
      newImages.forEach((img, index) => {
        img.sort_order = index + 1;
      });

      setImages(newImages);

      // Save to database
      await Promise.all(
        newImages.map(img => 
          adminCms.updateProjectImageOrder(img.id, img.sort_order!)
        )
      );
    } catch (error) {
      console.error('Error reordering images:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder images',
        variant: 'destructive',
      });
      // Revert on error
      await fetchImages(id!);
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${isEditing ? 'Edit' : 'New'} Project - Admin Panel`}
        description="Edit project details"
      />
      
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
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={project.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={project.slug || ''}
                    onChange={(e) => setProject(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="project-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={project.excerpt || ''}
                    onChange={(e) => setProject(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief description of the project"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="body">Content</Label>
                  <Textarea
                    id="body"
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
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gallery Management */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Project Gallery</CardTitle>
                      <CardDescription>Manage project images and their order</CardDescription>
                    </div>
                    <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Image
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Image</DialogTitle>
                          <DialogDescription>
                            Add a new image to the project gallery
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="imageUrl">Image URL *</Label>
                            <Input
                              id="imageUrl"
                              value={newImage.url}
                              onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div>
                            <Label htmlFor="imageAlt">Alt Text</Label>
                            <Input
                              id="imageAlt"
                              value={newImage.alt}
                              onChange={(e) => setNewImage(prev => ({ ...prev, alt: e.target.value }))}
                              placeholder="Description of the image"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddImage} disabled={!newImage.url.trim()}>
                              Add Image
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {images.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No images added yet. Click "Add Image" to get started.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {images.map((image, index) => (
                        <div key={image.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <img
                            src={image.url}
                            alt={image.alt || 'Project image'}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium truncate">{image.alt || 'Untitled'}</p>
                            <p className="text-sm text-muted-foreground truncate">{image.url}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorderImage(image.id, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorderImage(image.id, 'down')}
                              disabled={index === images.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={project.status} onValueChange={(value) => setProject(prev => ({ ...prev, status: value as 'draft' | 'published' }))}>
                    <SelectTrigger>
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
                    <span className="text-sm font-medium">Status</span>
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
