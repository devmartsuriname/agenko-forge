import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { Project } from '@/types/content';
import { useAuth } from '@/lib/auth';
import { formatDate, getStatusBadgeVariant } from '@/lib/admin-utils';
import { adminToast } from '@/lib/toast-utils';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingListSkeleton } from '@/components/admin/LoadingSkeleton';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, FolderOpen } from 'lucide-react';

function AdminProjects() {
  const { isAdmin, isEditor } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const fetchProjects = async () => {
    try {
      const data = await adminCms.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        adminToast.permissionDenied('view projects');
      } else {
        adminToast.networkError();
      }
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm.trim()) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleDelete = async (project: Project) => {
    setDeleting(true);
    try {
      await adminCms.deleteProject(project.id);
      setProjects(prev => prev.filter(p => p.id !== project.id));
      adminToast.deleted('Project', project.title);
    } catch (error) {
      console.error('Error deleting project:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        adminToast.permissionDenied('delete projects');
      } else {
        adminToast.error('Failed to Delete', 'Unable to delete project. Please try again.');
      }
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  if (!isEditor) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to manage projects.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Projects - Admin Panel"
          description="Manage portfolio projects"
        />
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground">Manage your portfolio projects</p>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
          <LoadingListSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Projects - Admin Panel"
        description="Manage portfolio projects"
      />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">Manage your portfolio projects</p>
          </div>
          
          <Link to="/admin/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Projects</CardTitle>
            <CardDescription>Search and filter your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, slug, or excerpt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Projects ({filteredProjects.length})</CardTitle>
            <CardDescription>All your portfolio projects</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProjects.length === 0 ? (
              projects.length === 0 ? (
                <EmptyState
                  icon={FolderOpen}
                  title="No projects yet"
                  description="Create your first portfolio project to showcase your work to potential clients."
                  actionLabel="Create First Project"
                  actionTo="/admin/projects/new"
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="No projects found"
                  description="Try adjusting your search terms or filters to find what you're looking for."
                  actionLabel="Clear Filters"
                  actionTo="/admin/projects"
                />
              )
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          <Badge variant={getStatusBadgeVariant(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/portfolio/{project.slug}</p>
                        {project.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{project.excerpt}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {project.status === 'published' 
                            ? `Published ${formatDate(project.published_at)}`
                            : `Updated ${formatDate(project.updated_at)}`
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {project.status === 'published' && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/portfolio/${project.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/projects/${project.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        
                        {isAdmin && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteConfirm(project)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <ConfirmDialog
                              open={deleteConfirm?.id === project.id}
                              onOpenChange={() => setDeleteConfirm(null)}
                              title="Delete Project"
                              description={
                                <>
                                  Are you sure you want to delete <strong>"{project.title}"</strong>?
                                  <br /><br />
                                  This action cannot be undone and will also delete all associated images.
                                  {project.status === 'published' && (
                                    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                                      <strong>Warning:</strong> This project is currently published and visible to visitors.
                                    </div>
                                  )}
                                </>
                              }
                              confirmLabel="Delete Project"
                              variant="destructive"
                              onConfirm={() => handleDelete(project)}
                              loading={deleting}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default AdminProjects;