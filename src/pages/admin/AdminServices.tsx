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
import { Service } from '@/types/content';
import { useAuth } from '@/lib/auth';
import { formatDate, getStatusBadgeVariant } from '@/lib/admin-utils';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

function AdminServices() {
  const { isAdmin, isEditor } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, statusFilter]);

  const fetchServices = async () => {
    try {
      const data = await adminCms.getAllServices();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm.trim()) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => service.status === statusFilter);
    }

    setFilteredServices(filtered);
  };

  const handleDelete = async (service: Service) => {
    setDeleting(true);
    try {
      await adminCms.deleteService(service.id);
      setServices(prev => prev.filter(s => s.id !== service.id));
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
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
        <p className="text-muted-foreground">You don't have permission to manage services.</p>
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
        title="Services - Admin Panel"
        description="Manage website services"
      />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Services</h1>
            <p className="text-muted-foreground">Manage your service offerings</p>
          </div>
          
          <Link to="/admin/services/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Service
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Services</CardTitle>
            <CardDescription>Search and filter your services</CardDescription>
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

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>Services ({filteredServices.length})</CardTitle>
            <CardDescription>All your services</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredServices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchTerm || statusFilter !== 'all' ? 'No services found matching your filters.' : 'No services found.'}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{service.title}</h3>
                          <Badge variant={getStatusBadgeVariant(service.status)}>
                            {service.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/services/{service.slug}</p>
                        {service.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{service.excerpt}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {service.status === 'published' 
                            ? `Published ${formatDate(service.published_at)}`
                            : `Updated ${formatDate(service.updated_at)}`
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {service.status === 'published' && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/services/${service.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/services/${service.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        
                        {isAdmin && (
                          <Dialog open={deleteConfirm?.id === service.id} onOpenChange={() => setDeleteConfirm(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteConfirm(service)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Service</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete "{service.title}"? This action cannot be undone.
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
                                  onClick={() => handleDelete(service)}
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

export default AdminServices;