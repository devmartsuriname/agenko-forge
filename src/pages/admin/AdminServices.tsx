import { useEffect, useState, useCallback, useRef } from 'react';
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
import { adminToast } from '@/lib/toast-utils';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingListSkeleton } from '@/components/admin/LoadingSkeleton';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  
  // Graceful degradation states
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showSlowConnectionWarning, setShowSlowConnectionWarning] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Performance and reliability tracking
  const slowConnectionTimer = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  
  const MAX_RETRIES = 3;
  const SLOW_CONNECTION_THRESHOLD = 5000; // 5 seconds

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('[AdminServices] Connection restored');
      setIsOnline(true);
      setHasError(null);
      // Retry if we were previously offline and had an error
      if (hasError && retryCount < MAX_RETRIES) {
        fetchServices();
      }
    };
    
    const handleOffline = () => {
      console.log('[AdminServices] Connection lost');
      setIsOnline(false);
      setShowSlowConnectionWarning(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasError, retryCount]);

  useEffect(() => {
    console.log('[AdminServices] Component mounted, initializing fetchServices...');
    fetchServices();
    
    // Cleanup on unmount
    return () => {
      if (slowConnectionTimer.current) {
        clearTimeout(slowConnectionTimer.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, statusFilter]);

  const calculateRetryDelay = useCallback((attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attempt), 8000);
  }, []);

  const fetchServices = useCallback(async (isRetry = false) => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear existing timers
    if (slowConnectionTimer.current) {
      clearTimeout(slowConnectionTimer.current);
    }
    
    const startTime = performance.now();
    console.log('[AdminServices] Starting fetchServices...', { 
      timestamp: new Date().toISOString(),
      isRetry,
      retryCount,
      isOnline
    });
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    if (isRetry) {
      setIsRetrying(true);
    } else {
      setLoading(true);
      setRetryCount(0);
      setHasError(null);
    }
    
    // Set slow connection warning timer
    slowConnectionTimer.current = setTimeout(() => {
      if (!isRetry) {
        console.log('[AdminServices] Slow connection detected');
        setShowSlowConnectionWarning(true);
      }
    }, SLOW_CONNECTION_THRESHOLD);
    
    try {
      console.log('[AdminServices] Calling adminCms.getAllServices()...');
      
      // Add timeout to the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000); // 30s timeout
      });
      
      const fetchPromise = adminCms.getAllServices();
      const data = await Promise.race([fetchPromise, timeoutPromise]) as Service[];
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('[AdminServices] Request was aborted');
        return;
      }
      
      const fetchTime = performance.now() - startTime;
      console.log('[AdminServices] Services fetched successfully', { 
        count: data.length, 
        fetchTime: `${fetchTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      
      setServices(data);
      setHasError(null);
      setRetryCount(0);
      setShowSlowConnectionWarning(false);
      
      if (fetchTime > SLOW_CONNECTION_THRESHOLD && !isRetry) {
        toast({
          title: "Slow Connection",
          description: `Data loaded in ${(fetchTime / 1000).toFixed(1)}s. Consider checking your connection.`,
          duration: 3000,
        });
      }
      
    } catch (error: any) {
      const errorTime = performance.now() - startTime;
      const errorMessage = error?.message || 'Unknown error';
      
      console.error('[AdminServices] Error fetching services:', error, {
        errorTime: `${errorTime.toFixed(2)}ms`,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage,
        timestamp: new Date().toISOString(),
        retryCount,
        isOnline
      });
      
      setHasError(errorMessage);
      
      // Determine if we should retry
      const shouldRetry = retryCount < MAX_RETRIES && 
                         isOnline && 
                         !abortControllerRef.current?.signal.aborted &&
                         !errorMessage.includes('permission');
      
      if (shouldRetry) {
        const delay = calculateRetryDelay(retryCount);
        console.log(`[AdminServices] Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        setRetryCount(prev => prev + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchServices(true);
        }, delay);
        
      } else {
        // Handle different error types
        if (error instanceof Error && error.message.includes('permission')) {
          adminToast.permissionDenied('view services');
        } else if (!isOnline) {
          toast({
            title: "Connection Error",
            description: "You appear to be offline. Please check your connection and try again.",
            variant: "destructive",
            duration: 5000,
          });
        } else if (errorMessage.includes('timeout')) {
          toast({
            title: "Request Timeout",
            description: "The request took too long. Please try again or check your connection.",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          adminToast.networkError();
        }
      }
    } finally {
      const totalTime = performance.now() - startTime;
      console.log('[AdminServices] fetchServices completed', { 
        totalTime: `${totalTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Clear timers
      if (slowConnectionTimer.current) {
        clearTimeout(slowConnectionTimer.current);
      }
      
      setLoading(false);
      setIsRetrying(false);
    }
  }, [retryCount, isOnline, calculateRetryDelay, toast]);

  const handleRetry = useCallback(() => {
    console.log('[AdminServices] Manual retry triggered');
    setRetryCount(0);
    fetchServices(false);
  }, [fetchServices]);

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
      adminToast.deleted('Service', service.title);
    } catch (error) {
      console.error('Error deleting service:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        adminToast.permissionDenied('delete services');
      } else {
        adminToast.error('Failed to Delete', 'Unable to delete service. Please try again.');
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
        <p className="text-muted-foreground">You don't have permission to manage services.</p>
      </div>
    );
  }

  if (loading && !isRetrying) {
    return (
      <>
        <SEOHead 
          title="Services - Admin Panel"
          description="Manage service offerings"
        />
        <meta name="robots" content="noindex,nofollow" />
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Services</h1>
              <p className="text-muted-foreground">Manage your service offerings</p>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Service
            </Button>
          </div>
          
          {/* Show connection warnings during loading */}
          {showSlowConnectionWarning && (
            <Alert className="border-orange-200 bg-orange-50">
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                Loading is taking longer than usual. This might be due to a slow connection.
                {retryCount > 0 && ` Retry attempt ${retryCount}/${MAX_RETRIES}...`}
              </AlertDescription>
            </Alert>
          )}
          
          {!isOnline && (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You appear to be offline. Please check your internet connection.
              </AlertDescription>
            </Alert>
          )}
          
          <LoadingListSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Services - Admin Panel"
        description="Manage service offerings"
      />
      <meta name="robots" content="noindex,nofollow" />
      
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Services</h1>
              <p className="text-muted-foreground">
                Manage your service offerings
                {isRetrying && <span className="text-orange-600 ml-2">(Retrying...)</span>}
              </p>
            </div>
            
            <Link to="/admin/services/new">
              <Button disabled={!isOnline}>
                <Plus className="h-4 w-4 mr-2" />
                New Service
              </Button>
            </Link>
          </div>

          {/* Connection and error alerts */}
          {!isOnline && (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>You appear to be offline. Some features may be limited.</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="ml-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {hasError && isOnline && (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>
                  Failed to load services: {hasError}
                  {retryCount > 0 && ` (${retryCount}/${MAX_RETRIES} retries)`}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="ml-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {showSlowConnectionWarning && isOnline && !hasError && (
            <Alert className="border-orange-200 bg-orange-50">
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                Connection seems slow. Data is loading in the background...
              </AlertDescription>
            </Alert>
          )}

          {/* Filters - Always show, but disable when offline */}
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
                    disabled={!isOnline}
                  />
                </div>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                  disabled={!isOnline}
                >
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

          {/* Services List - Show even during loading/error states */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Services ({filteredServices.length})</span>
                {isRetrying && (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>All your services</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Show content if we have data, even during errors */}
              {services.length === 0 && !hasError ? (
                <EmptyState
                  icon={Settings}
                  title="No services yet"
                  description="Create your first service offering to showcase what you provide to clients and how you can help them achieve their goals."
                  actionLabel="Create First Service"
                  actionTo="/admin/services/new"
                />
              ) : filteredServices.length === 0 && services.length > 0 ? (
                <EmptyState
                  icon={Search}
                  title="No services found"
                  description="Try adjusting your search terms or filters to find what you're looking for."
                  actionLabel="Clear Filters"
                  actionTo="/admin/services"
                />
              ) : hasError && services.length === 0 ? (
                <EmptyState
                  icon={WifiOff}
                  title="Failed to load services"
                  description="There was a problem loading your services. Please check your connection and try again."
                  actionLabel="Try Again"
                  actionTo=""
                  onActionClick={handleRetry}
                />
              ) : (
                <div className="space-y-4">
                  {/* Show loading skeleton for new items if retrying */}
                  {isRetrying && services.length === 0 && <LoadingListSkeleton />}
                  
                  {filteredServices.map((service) => (
                    <div 
                      key={service.id} 
                      className={`border rounded-lg p-4 transition-opacity ${
                        isRetrying ? 'opacity-75' : 'opacity-100'
                      }`}
                    >
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
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            disabled={!isOnline}
                          >
                            <Link to={`/admin/services/${service.id}/edit`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          
                          {isAdmin && (
                            <>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteConfirm(service)}
                                disabled={!isOnline}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <ConfirmDialog
                                open={deleteConfirm?.id === service.id}
                                onOpenChange={() => setDeleteConfirm(null)}
                                title="Delete Service"
                                description={
                                  <>
                                    Are you sure you want to delete <strong>"{service.title}"</strong>?
                                    <br /><br />
                                    This action cannot be undone.
                                    {service.status === 'published' && (
                                      <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                                        <strong>Warning:</strong> This service is currently published and visible to visitors.
                                      </div>
                                    )}
                                  </>
                                }
                                confirmLabel="Delete Service"
                                variant="destructive"
                                onConfirm={() => handleDelete(service)}
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

export default AdminServices;