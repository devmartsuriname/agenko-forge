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
import { Plus, Search, Edit, Trash2, Eye, Briefcase } from 'lucide-react';

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  client?: string;
  industry?: string;
  status: 'draft' | 'published';
  published_at?: string;
  updated_at?: string;
}

function AdminCaseStudies() {
  const { isAdmin, isEditor } = useAuth();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<CaseStudy | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  useEffect(() => {
    filterCaseStudies();
  }, [caseStudies, searchTerm, statusFilter]);

  const fetchCaseStudies = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('id, title, slug, summary, client, industry, status, published_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCaseStudies(data?.map(item => ({
        ...item,
        status: item.status as 'draft' | 'published'
      })) || []);
    } catch (error) {
      console.error('Error fetching case studies:', error);
      adminToast.networkError();
    } finally {
      setLoading(false);
    }
  };

  const filterCaseStudies = () => {
    let filtered = caseStudies;

    if (searchTerm.trim()) {
      filtered = filtered.filter(caseStudy =>
        caseStudy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseStudy.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseStudy.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseStudy.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseStudy.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(caseStudy => caseStudy.status === statusFilter);
    }

    setFilteredCaseStudies(filtered);
  };

  const handleDelete = async (caseStudy: CaseStudy) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('case_studies')
        .delete()
        .eq('id', caseStudy.id);

      if (error) throw error;

      setCaseStudies(prev => prev.filter(cs => cs.id !== caseStudy.id));
      adminToast.deleted('Case Study', caseStudy.title);
    } catch (error) {
      console.error('Error deleting case study:', error);
      adminToast.error('Failed to Delete', 'Unable to delete case study. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  if (!isEditor) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to manage case studies.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Case Studies - Admin Panel"
          description="Manage case studies"
        />
        <meta name="robots" content="noindex,nofollow" />
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Case Studies</h1>
              <p className="text-muted-foreground">Manage your case studies and client success stories</p>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Case Study
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
        title="Case Studies - Admin Panel"
        description="Manage case studies"
      />
      <meta name="robots" content="noindex,nofollow" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Case Studies</h1>
            <p className="text-muted-foreground">Manage your case studies and client success stories</p>
          </div>
          
          <Link to="/admin/case-studies/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Case Study
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Case Studies</CardTitle>
            <CardDescription>Search and filter your case studies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, client, industry..."
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

        {/* Case Studies List */}
        <Card>
          <CardHeader>
            <CardTitle>Case Studies ({filteredCaseStudies.length})</CardTitle>
            <CardDescription>All your case studies</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCaseStudies.length === 0 ? (
              caseStudies.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No case studies yet"
                  description="Create your first case study to showcase successful client projects and demonstrate the value you deliver."
                  actionLabel="Create First Case Study"
                  actionTo="/admin/case-studies/new"
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="No case studies found"
                  description="Try adjusting your search terms or filters to find what you're looking for."
                  actionLabel="Clear Filters"
                  actionTo="/admin/case-studies"
                />
              )
            ) : (
              <div className="space-y-4">
                {filteredCaseStudies.map((caseStudy) => (
                  <div key={caseStudy.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{caseStudy.title}</h3>
                          <Badge variant={getStatusBadgeVariant(caseStudy.status)}>
                            {caseStudy.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/case-studies/{caseStudy.slug}</p>
                        {caseStudy.client && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Client:</span> {caseStudy.client}
                            {caseStudy.industry && ` • ${caseStudy.industry}`}
                          </p>
                        )}
                        {caseStudy.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{caseStudy.summary}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {caseStudy.status === 'published' 
                            ? `Published ${formatDate(caseStudy.published_at)}`
                            : `Updated ${formatDate(caseStudy.updated_at)}`
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {caseStudy.status === 'published' && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/case-studies/${caseStudy.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/case-studies/${caseStudy.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        
                        {isAdmin && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteConfirm(caseStudy)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <ConfirmDialog
                              open={deleteConfirm?.id === caseStudy.id}
                              onOpenChange={() => setDeleteConfirm(null)}
                              title="Delete Case Study"
                              description={
                                <>
                                  Are you sure you want to delete <strong>"{caseStudy.title}"</strong>?
                                  <br /><br />
                                  This action cannot be undone.
                                  {caseStudy.status === 'published' && (
                                    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                                      <strong>Warning:</strong> This case study is currently published and visible to visitors.
                                    </div>
                                  )}
                                </>
                              }
                              confirmLabel="Delete Case Study"
                              variant="destructive"
                              onConfirm={() => handleDelete(caseStudy)}
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

export default AdminCaseStudies;