import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MousePointer, Mail } from 'lucide-react';

interface CTAMetrics {
  total_interactions: number;
  email_signups: number;
  conversion_rate: number;
  top_cta_types: Array<{ cta_type: string; count: number }>;
  daily_interactions: Array<{ date: string; interactions: number; signups: number }>;
}

export function CTAAnalytics() {
  const [metrics, setMetrics] = useState<CTAMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCTAMetrics();
  }, []);

  const fetchCTAMetrics = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch CTA interactions
      const { data: interactions } = await supabase
        .from('cta_interactions')
        .select('*')
        .gte('created_at', sevenDaysAgo);

      // Fetch email subscriptions
      const { data: subscriptions } = await supabase
        .from('email_subscriptions')
        .select('*')
        .gte('created_at', sevenDaysAgo);

      if (interactions && subscriptions) {
        // Calculate metrics
        const totalInteractions = interactions.length;
        const emailSignups = subscriptions.length;
        const conversionRate = totalInteractions > 0 ? (emailSignups / totalInteractions) * 100 : 0;

        // Top CTA types
        const ctaTypeCounts = interactions.reduce((acc: Record<string, number>, interaction) => {
          acc[interaction.cta_type] = (acc[interaction.cta_type] || 0) + 1;
          return acc;
        }, {});

        const topCtaTypes = Object.entries(ctaTypeCounts)
          .map(([cta_type, count]) => ({ cta_type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Daily interactions (last 7 days)
        const dailyData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayInteractions = interactions.filter(interaction => 
            interaction.created_at.startsWith(dateStr)
          ).length;
          
          const daySignups = subscriptions.filter(subscription => 
            subscription.created_at.startsWith(dateStr)
          ).length;

          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            interactions: dayInteractions,
            signups: daySignups
          };
        });

        setMetrics({
          total_interactions: totalInteractions,
          email_signups: emailSignups,
          conversion_rate: conversionRate,
          top_cta_types: topCtaTypes,
          daily_interactions: dailyData
        });
      }
    } catch (error) {
      console.error('Error fetching CTA metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const chartConfig = {
    interactions: { label: 'Interactions', color: 'hsl(var(--primary))' },
    signups: { label: 'Signups', color: 'hsl(var(--secondary))' }
  };

  const pieColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_interactions}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Signups</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.email_signups}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversion_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">CTA to signup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active CTAs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.top_cta_types.length}</div>
            <p className="text-xs text-muted-foreground">Different types</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily CTA Activity</CardTitle>
            <CardDescription>Interactions and signups over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={metrics.daily_interactions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                />
                <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="interactions" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="signups" fill="hsl(var(--secondary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* CTA Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>CTA Performance</CardTitle>
            <CardDescription>Distribution of interactions by CTA type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={metrics.top_cta_types}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="cta_type"
                  label={({ cta_type, percent }) => `${cta_type} ${(percent * 100).toFixed(0)}%`}
                >
                  {metrics.top_cta_types.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}