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
import { Plus, Search, Edit, Trash2, Eye, Users, ExternalLink } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  slug: string;
  team?: string;
  location?: string;
  work_mode?: string;
  type?: string;
  description?: string;
  apply_url?: string;
  email?: string;
  status: string;
  published_at?: string;
  updated_at?: string;
}

function AdminCareers() {
  const { isAdmin, isEditor } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, slug, team, location, work_mode, type, description, apply_url, email, status, published_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      adminToast.networkError();
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm.trim()) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.work_mode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleDelete = async (job: Job) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', job.id);

      if (error) throw error;

      setJobs(prev => prev.filter(j => j.id !== job.id));
      adminToast.deleted('Job Posting', job.title);
    } catch (error) {
      console.error('Error deleting job:', error);
      adminToast.error('Failed to Delete', 'Unable to delete job posting. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const getJobStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'closed': return 'secondary';
      case 'filled': return 'outline';
      default: return 'outline';
    }
  };

  if (!isEditor) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to manage job postings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Careers - Admin Panel"
          description="Manage job postings"
        />
        <meta name="robots" content="noindex,nofollow" />
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
              <p className="text-muted-foreground">Manage your career opportunities and job listings</p>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Job Posting
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
        title="Careers - Admin Panel"
        description="Manage job postings"
      />
      <meta name="robots" content="noindex,nofollow" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
            <p className="text-muted-foreground">Manage your career opportunities and job listings</p>
          </div>
          
          <Link to="/admin/careers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Job Posting
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Job Postings</CardTitle>
            <CardDescription>Search and filter your job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, team, location..."
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Job Postings ({filteredJobs.length})</CardTitle>
            <CardDescription>All your job opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredJobs.length === 0 ? (
              jobs.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No job postings yet"
                  description="Create your first job posting to attract talented individuals to join your team."
                  actionLabel="Create First Job"
                  actionTo="/admin/careers/new"
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="No jobs found"
                  description="Try adjusting your search terms or filters to find what you're looking for."
                  actionLabel="Clear Filters"
                  actionTo="/admin/careers"
                />
              )
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant={getJobStatusVariant(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/careers/{job.slug}</p>
                        
                        {/* Job Details */}
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {job.team && <span className="font-medium">{job.team}</span>}
                          {job.location && <span>• {job.location}</span>}
                          {job.work_mode && <span>• {job.work_mode}</span>}
                          {job.type && <span>• {job.type}</span>}
                        </div>

                        {/* Apply Links */}
                        <div className="flex items-center space-x-4">
                          {job.apply_url && (
                            <a
                              href={job.apply_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center space-x-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Apply Link</span>
                            </a>
                          )}
                          {job.email && (
                            <a
                              href={`mailto:${job.email}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {job.email}
                            </a>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {job.status === 'open' && job.published_at
                            ? `Published ${formatDate(job.published_at)}`
                            : `Updated ${formatDate(job.updated_at)}`
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {(job.status === 'open' || job.status === 'closed') && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/careers/${job.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/careers/${job.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        
                        {isAdmin && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteConfirm(job)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <ConfirmDialog
                              open={deleteConfirm?.id === job.id}
                              onOpenChange={() => setDeleteConfirm(null)}
                              title="Delete Job Posting"
                              description={
                                <>
                                  Are you sure you want to delete <strong>"{job.title}"</strong>?
                                  <br /><br />
                                  This action cannot be undone.
                                  {job.status === 'open' && (
                                    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                                      <strong>Warning:</strong> This job is currently open and visible to applicants.
                                    </div>
                                  )}
                                </>
                              }
                              confirmLabel="Delete Job"
                              variant="destructive"
                              onConfirm={() => handleDelete(job)}
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

export default AdminCareers;