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
import { Page } from '@/types/content';
import { useAuth } from '@/lib/auth';
import { formatDate, getStatusBadgeVariant } from '@/lib/admin-utils';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

function AdminPages() {
  const { isAdmin, isEditor } = useAuth();
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    filterPages();
  }, [pages, searchTerm, statusFilter]);

  const fetchPages = async () => {
    try {
      const data = await adminCms.getAllPages();
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPages = () => {
    let filtered = pages;

    if (searchTerm.trim()) {
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(page => page.status === statusFilter);
    }

    setFilteredPages(filtered);
  };

  const handleDelete = async (page: Page) => {
    setDeleting(true);
    try {
      await adminCms.deletePage(page.id);
      setPages(prev => prev.filter(p => p.id !== page.id));
      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  if (!isEditor) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to manage pages.</p>
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
        title="Pages - Admin Panel"
        description="Manage website pages"
      />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pages</h1>
            <p className="text-muted-foreground">Manage website pages and content</p>
          </div>
          
          <Link to="/admin/pages/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Pages</CardTitle>
            <CardDescription>Search and filter your pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or slug..."
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

        {/* Pages List */}
        <Card>
          <CardHeader>
            <CardTitle>Pages ({filteredPages.length})</CardTitle>
            <CardDescription>All website pages</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchTerm || statusFilter !== 'all' ? 'No pages found matching your filters.' : 'No pages found.'}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <div key={page.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{page.title}</h3>
                          <Badge variant={getStatusBadgeVariant(page.status)}>
                            {page.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                        <p className="text-sm text-muted-foreground">
                          {page.status === 'published' 
                            ? `Published ${formatDate(page.published_at)}`
                            : `Updated ${formatDate(page.updated_at)}`
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {page.status === 'published' && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/${page.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/pages/${page.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        
                        {isAdmin && (
                          <Dialog open={deleteConfirm?.id === page.id} onOpenChange={() => setDeleteConfirm(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteConfirm(page)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Page</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete "{page.title}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteConfirm(null)}
                                  disabled={deleting}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(page)}
                                  disabled={deleting}
                                >
                                  {deleting ? 'Deleting...' : 'Delete'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
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

export default AdminPages;