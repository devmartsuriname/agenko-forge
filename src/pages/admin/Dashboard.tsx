import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/lib/seo';
import { useAuth } from '@/lib/auth';
import { FileText, Briefcase, FolderOpen, PenTool, MessageSquare, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { UnifiedPerformanceMonitor } from '@/components/performance/UnifiedPerformanceMonitor';
import { FinalValidationDashboard } from '@/components/admin/FinalValidationDashboard';
import { CTAAnalytics } from '@/components/admin/analytics/CTAAnalytics';
import { SystemHealthWidget } from '@/components/admin/SystemHealthWidget';
import { ErrorBoundaryWrapper } from '@/components/admin/ErrorBoundaryWrapper';
import { SecurityMonitor } from '@/components/admin/SecurityMonitor';
import { NetworkDebugWidget } from '@/components/admin/NetworkDebugWidget';

interface DashboardStats {
  services: number;
  projects: number;
  blogPosts: number;
  pages: number;
  contactSubmissions: number;
}

interface KPIData {
  total: number;
  weeklyDelta: number;
  isPositive: boolean;
}

interface ChartDataPoint {
  date: string;
  blog: number;
  projects: number;
  services: number;
  pages: number;
  contacts: number;
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
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    services: 0,
    projects: 0,
    blogPosts: 0,
    pages: 0,
    contactSubmissions: 0,
  });
  const [kpis, setKpis] = useState<Record<string, KPIData>>({});
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);

      // Fetch current totals and weekly data for KPIs
      const [servicesRes, projectsRes, blogRes, pagesRes, contactRes] = await Promise.all([
        supabase.from('services').select('id, created_at', { count: 'exact' }).eq('status', 'published'),
        supabase.from('projects').select('id, created_at', { count: 'exact' }).eq('status', 'published'),
        supabase.from('blog_posts').select('id, created_at', { count: 'exact' }).eq('status', 'published'),
        supabase.from('pages').select('id, created_at', { count: 'exact' }).eq('status', 'published'),
        supabase.from('contact_submissions').select('id, created_at', { count: 'exact' }),
      ]);

      // Calculate weekly deltas
      const calculateKPI = (data: any[], total: number): KPIData => {
        const weeklyCount = data?.filter(item => 
          new Date(item.created_at) >= weekAgo
        ).length || 0;
        
        return {
          total,
          weeklyDelta: weeklyCount,
          isPositive: weeklyCount >= 0
        };
      };

      setStats({
        services: servicesRes.count || 0,
        projects: projectsRes.count || 0,
        blogPosts: blogRes.count || 0,
        pages: pagesRes.count || 0,
        contactSubmissions: contactRes.count || 0,
      });

      setKpis({
        services: calculateKPI(servicesRes.data || [], servicesRes.count || 0),
        projects: calculateKPI(projectsRes.data || [], projectsRes.count || 0),
        blog: calculateKPI(blogRes.data || [], blogRes.count || 0),
        pages: calculateKPI(pagesRes.data || [], pagesRes.count || 0),
        contacts: calculateKPI(contactRes.data || [], contactRes.count || 0),
      });

      // Fetch 30-day chart data
      await fetchChartData(monthAgo);

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
          .select('id, name, email, subject, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        recentContact?.forEach(item => {
          recentData.push({ 
            id: item.id, 
            title: item.subject || `Message from ${item.name}`, 
            status: 'new', 
            created_at: item.created_at, 
            type: 'contact' 
          });
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

  const fetchChartData = async (monthAgo: Date) => {
    try {
      // Generate array of last 30 days
      const days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return {
          date: format(date, 'MMM dd'),
          fullDate: date,
          blog: 0,
          projects: 0,
          services: 0,
          pages: 0,
          contacts: 0,
        };
      });

      // Fetch published content for the last 30 days
      const [blogData, projectData, serviceData, pageData, contactData] = await Promise.all([
        supabase.from('blog_posts').select('published_at').eq('status', 'published').gte('published_at', monthAgo.toISOString()),
        supabase.from('projects').select('published_at').eq('status', 'published').gte('published_at', monthAgo.toISOString()),
        supabase.from('services').select('published_at').eq('status', 'published').gte('published_at', monthAgo.toISOString()),
        supabase.from('pages').select('published_at').eq('status', 'published').gte('published_at', monthAgo.toISOString()),
        supabase.from('contact_submissions').select('created_at').gte('created_at', monthAgo.toISOString()),
      ]);

      // Count items per day
      [blogData, projectData, serviceData, pageData, contactData].forEach((dataset, index) => {
        const field = ['blog', 'projects', 'services', 'pages', 'contacts'][index];
        const dateField = index === 4 ? 'created_at' : 'published_at';
        
        dataset.data?.forEach(item => {
          const itemDate = new Date(item[dateField]);
          const dayIndex = days.findIndex(day => 
            format(day.fullDate, 'yyyy-MM-dd') === format(itemDate, 'yyyy-MM-dd')
          );
          if (dayIndex >= 0) {
            days[dayIndex][field as keyof typeof days[0]]++;
          }
        });
      });

      setChartData(days);
    } catch (error) {
      console.error('Error fetching chart data:', error);
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

  const quickActions = [
    { label: 'New Blog Post', path: '/admin/blog/new', icon: PenTool },
    { label: 'New Project', path: '/admin/projects/new', icon: FolderOpen },
    { label: 'New Service', path: '/admin/services/new', icon: Briefcase },
    { label: 'New Page', path: '/admin/pages/new', icon: FileText },
  ];

  const chartConfig = {
    blog: { label: 'Blog Posts', color: 'hsl(var(--primary))' },
    projects: { label: 'Projects', color: 'hsl(var(--secondary))' },
    services: { label: 'Services', color: 'hsl(var(--accent))' },
    pages: { label: 'Pages', color: 'hsl(var(--muted))' },
    contacts: { label: 'Contacts', color: 'hsl(var(--destructive))' },
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
        description="Admin dashboard for Devmart Agency"
      />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>

        {/* Security Monitor - Admin Only */}
        <ErrorBoundaryWrapper>
          <SecurityMonitor />
        </ErrorBoundaryWrapper>

        {/* KPI Cards with 7-day delta */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            { key: 'services', label: 'Published Services', icon: Briefcase, value: stats.services },
            { key: 'projects', label: 'Published Projects', icon: FolderOpen, value: stats.projects },
            { key: 'blog', label: 'Published Posts', icon: PenTool, value: stats.blogPosts },
            { key: 'pages', label: 'Published Pages', icon: FileText, value: stats.pages },
            { key: 'contacts', label: 'Contact Submissions', icon: MessageSquare, value: stats.contactSubmissions },
          ].map(({ key, label, icon: Icon, value }) => {
            const kpi = kpis[key];
            return (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{value}</div>
                  {kpi && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      {kpi.isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                      )}
                      <span>+{kpi.weeklyDelta} this week</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Analytics */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">CTA Analytics</h2>
          <ErrorBoundaryWrapper>
            <CTAAnalytics />
          </ErrorBoundaryWrapper>
        </div>

        {/* Performance Monitor */}
        <UnifiedPerformanceMonitor />

        {/* Final Performance Validation */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Performance Validation</h2>
          <ErrorBoundaryWrapper>
            <FinalValidationDashboard />
          </ErrorBoundaryWrapper>
        </div>

        {/* Chart and Quick Actions Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 30-Day Activity Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>30-Day Activity</CardTitle>
                <CardDescription>Daily published content and contact submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillBlog" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="fillProjects" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="blog"
                      stackId="1"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#fillBlog)"
                    />
                    <Area
                      type="monotone"
                      dataKey="projects"
                      stackId="1"
                      stroke="hsl(var(--secondary))"
                      fillOpacity={1}
                      fill="url(#fillProjects)"
                    />
                    <Line
                      type="monotone"
                      dataKey="contacts"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          {(isEditor || userRole === 'admin') && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Create new content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.path}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate(action.path)}
                      aria-label={action.label}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* System Health and Network Debug Widgets */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ErrorBoundaryWrapper>
            <SystemHealthWidget />
          </ErrorBoundaryWrapper>
          <ErrorBoundaryWrapper>
            <NetworkDebugWidget />
          </ErrorBoundaryWrapper>
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