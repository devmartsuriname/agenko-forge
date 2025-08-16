import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/lib/seo';
import { useAuth } from '@/lib/auth';
import { FileText, Briefcase, FolderOpen, PenTool, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  services: number;
  projects: number;
  blogPosts: number;
  contactSubmissions: number;
}

interface RecentItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
  type: 'service' | 'project' | 'blog' | 'contact';
}

export default function AdminDashboard() {
  const { userRole, isEditor } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    services: 0,
    projects: 0,
    blogPosts: 0,
    contactSubmissions: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [servicesRes, projectsRes, blogRes, contactRes] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact' }),
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('blog_posts').select('id', { count: 'exact' }),
        supabase.from('contact_submissions').select('id', { count: 'exact' }),
      ]);

      setStats({
        services: servicesRes.count || 0,
        projects: projectsRes.count || 0,
        blogPosts: blogRes.count || 0,
        contactSubmissions: contactRes.count || 0,
      });

      // Fetch recent items if user has editor access
      if (isEditor) {
        const recentData: RecentItem[] = [];

        // Recent blog posts
        const { data: recentBlog } = await supabase
          .from('blog_posts')
          .select('id, title, status, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        recentBlog?.forEach(item => {
          recentData.push({ id: item.id, title: item.title, status: item.status, created_at: item.created_at, type: 'blog' });
        });

        // Recent projects
        const { data: recentProjects } = await supabase
          .from('projects')
          .select('id, title, status, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        recentProjects?.forEach(item => {
          recentData.push({ id: item.id, title: item.title, status: item.status, created_at: item.created_at, type: 'project' });
        });

        // Recent contact submissions
        const { data: recentContact } = await supabase
          .from('contact_submissions')
          .select('id, name as title, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        recentContact?.forEach(item => {
          recentData.push({ id: item.id, title: item.title, status: 'new', created_at: item.created_at, type: 'contact' });
        });

        // Sort by date and limit
        recentData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentItems(recentData.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'service': return <Briefcase className="h-4 w-4" />;
      case 'project': return <FolderOpen className="h-4 w-4" />;
      case 'blog': return <PenTool className="h-4 w-4" />;
      case 'contact': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

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
        title="Dashboard - Admin Panel"
        description="Admin dashboard for Agenko Agency"
      />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.services}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
              <PenTool className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.blogPosts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Submissions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contactSubmissions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {isEditor && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest content and submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentItems.length === 0 ? (
                <p className="text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentItems.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getItemIcon(item.type)}
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(item.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Role Information */}
        {userRole === 'viewer' && (
          <Card>
            <CardHeader>
              <CardTitle>Viewer Access</CardTitle>
              <CardDescription>
                You have read-only access to the admin panel. Contact an administrator to upgrade your permissions.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
}