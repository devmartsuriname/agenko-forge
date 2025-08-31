import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/lib/seo';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatDate, getStatusBadgeVariant } from '@/lib/admin-utils';
import { adminToast } from '@/lib/toast-utils';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingListSkeleton } from '@/components/admin/LoadingSkeleton';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Beaker, ExternalLink } from 'lucide-react';

interface LabProject {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  demo_url?: string;
  repo_url?: string;
  tags?: string[];
  status: 'draft' | 'published';
  published_at?: string;
  updated_at?: string;
}

function AdminInnovationLab() {
  const { isAdmin, isEditor } = useAuth();
  const [labProjects, setLabProjects] = useState<LabProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<LabProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<LabProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLabProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [labProjects, searchTerm, statusFilter]);

  const fetchLabProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_projects')
        .select('id, title, slug, summary, demo_url, repo_url, tags, status, published_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabProjects(data?.map(item => ({
        ...item,
        status: item.status as 'draft' | 'published'
      })) || []);
    } catch (error) {
      console.error('Error fetching lab projects:', error);
      adminToast.networkError();
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = labProjects;

    if (searchTerm.trim()) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleDelete = async (project: LabProject) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('lab_projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      setLabProjects(prev => prev.filter(p => p.id !== project.id));
      adminToast.deleted('Lab Project', project.title);
    } catch (error) {
      console.error('Error deleting lab project:', error);
      adminToast.error('Failed to Delete', 'Unable to delete lab project. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  if (!isEditor) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to manage lab projects.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Innovation Lab - Admin Panel"
          description="Manage lab projects"
        />
        <meta name="robots" content="noindex,nofollow" />
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Innovation Lab</h1>
              <p className="text-muted-foreground">Manage your experimental projects and open source work</p>
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
        title="Innovation Lab - Admin Panel"
        description="Manage lab projects"
      />
      <meta name="robots" content="noindex,nofollow" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Innovation Lab</h1>
            <p className="text-muted-foreground">Manage your experimental projects and open source work</p>
          </div>
          
          <Link to="/admin/innovation-lab/new">
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
            <CardDescription>Search and filter your lab projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, tags, or description..."
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
            <CardTitle>Lab Projects ({filteredProjects.length})</CardTitle>
            <CardDescription>All your experimental projects</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProjects.length === 0 ? (
              labProjects.length === 0 ? (
                <EmptyState
                  icon={Beaker}
                  title="No lab projects yet"
                  description="Create your first lab project to showcase experimental work, open source contributions, and innovative solutions."
                  actionLabel="Create First Project"
                  actionTo="/admin/innovation-lab/new"
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="No projects found"
                  description="Try adjusting your search terms or filters to find what you're looking for."
                  actionLabel="Clear Filters"
                  actionTo="/admin/innovation-lab"
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
                        <p className="text-sm text-muted-foreground">/innovation-lab/{project.slug}</p>
                        
                        {/* Demo and Repo Links */}
                        <div className="flex items-center space-x-4">
                          {project.demo_url && (
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center space-x-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Demo</span>
                            </a>
                          )}
                          {project.repo_url && (
                            <a
                              href={project.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center space-x-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Repository</span>
                            </a>
                          )}
                        </div>

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 4).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tags.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {project.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{project.summary}</p>
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
                            <Link to={`/innovation-lab/${project.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/innovation-lab/${project.id}/edit`}>
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
                              title="Delete Lab Project"
                              description={
                                <>
                                  Are you sure you want to delete <strong>"{project.title}"</strong>?
                                  <br /><br />
                                  This action cannot be undone.
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

export default AdminInnovationLab;