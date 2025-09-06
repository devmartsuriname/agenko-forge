import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Lock, 
  Eye,
  Users,
  Database,
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react';
import { securityAuditor, auditData } from '@/lib/security-audit';
import { useAuth } from '@/lib/auth';

interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  suspiciousActivity: {
    hasActivity: boolean;
    patterns: string[];
    recommendations: string[];
  };
  securityScore: number;
}

export const SecurityMonitor: React.FC = () => {
  const { hasPermission } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    eventsByType: {},
    eventsBySeverity: {},
    suspiciousActivity: { hasActivity: false, patterns: [], recommendations: [] },
    securityScore: 100
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Only show to admins
  if (!hasPermission(['admin'])) {
    return null;
  }

  useEffect(() => {
    loadSecurityMetrics();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadSecurityMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityMetrics = () => {
    try {
      setIsLoading(true);
      
      // Get security summary from auditor
      const summary = securityAuditor.generateSecuritySummary(24);
      
      // Calculate security score based on events and patterns
      let score = 100;
      
      // Deduct points for security events
      const criticalCount = summary.eventsBySeverity.critical || 0;
      const highCount = summary.eventsBySeverity.high || 0;
      const mediumCount = summary.eventsBySeverity.medium || 0;
      
      score -= criticalCount * 20;
      score -= highCount * 10;
      score -= mediumCount * 5;
      
      // Deduct points for suspicious activity
      if (summary.suspiciousActivity.hasActivity) {
        score -= summary.suspiciousActivity.patterns.length * 15;
      }
      
      score = Math.max(0, Math.min(100, score));
      
      setMetrics({
        totalEvents: summary.totalEvents,
        eventsByType: summary.eventsByType,
        eventsBySeverity: summary.eventsBySeverity,
        suspiciousActivity: summary.suspiciousActivity,
        securityScore: score
      });
      
      setLastUpdate(new Date().toLocaleTimeString());
      
      // Log the security check
      auditData.sensitiveAccess('security_monitor', 'view', undefined, 'admin_dashboard');
      
    } catch (error) {
      console.error('Failed to load security metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number): { label: string; variant: any } => {
    if (score >= 90) return { label: 'Excellent', variant: 'default' };
    if (score >= 70) return { label: 'Good', variant: 'secondary' };
    if (score >= 50) return { label: 'Warning', variant: 'destructive' };
    return { label: 'Critical', variant: 'destructive' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading security metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreStatus = getScoreStatus(metrics.securityScore);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security Monitor</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadSecurityMetrics}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant={scoreStatus.variant}>
              {scoreStatus.label}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Real-time security monitoring and threat detection
          {lastUpdate && <span className="block text-xs mt-1">Last updated: {lastUpdate}</span>}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Security Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Security Score</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.securityScore)}`}>
                    {metrics.securityScore}/100
                  </div>
                  <Progress value={metrics.securityScore} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Events (24h)</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.totalEvents}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Threat Level</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {metrics.suspiciousActivity.hasActivity ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-500 font-medium">Active</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-500 font-medium">Clear</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Security Status */}
            {metrics.suspiciousActivity.hasActivity && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Suspicious Activity Detected:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {metrics.suspiciousActivity.patterns.map((pattern, index) => (
                      <li key={index} className="text-sm">{pattern}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics.eventsByType).map(([type, count]) => (
                <Card key={type}>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2 mb-1">
                      {type === 'authentication' && <Lock className="h-4 w-4" />}
                      {type === 'authorization' && <Users className="h-4 w-4" />}
                      {type === 'data_access' && <Eye className="h-4 w-4" />}
                      {type === 'data_modification' && <Database className="h-4 w-4" />}
                      {type === 'suspicious_activity' && <AlertTriangle className="h-4 w-4" />}
                      <span className="text-sm font-medium capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-lg font-bold">{count}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="threats" className="space-y-4">
            {metrics.suspiciousActivity.hasActivity ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Active Threats Detected</strong>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Detected Patterns:</h4>
                  {metrics.suspiciousActivity.patterns.map((pattern, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <span className="text-sm text-red-700">{pattern}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Recommendations:</h4>
                  {metrics.suspiciousActivity.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <Settings className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm text-blue-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-700 mb-2">All Clear</h3>
                <p className="text-sm text-green-600">No suspicious activity detected in the last 24 hours.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="audit" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics.eventsBySeverity).map(([severity, count]) => (
                <Card key={severity}>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">{severity}</span>
                    </div>
                    <div className={`text-lg font-bold ${
                      severity === 'critical' ? 'text-red-600' :
                      severity === 'high' ? 'text-orange-600' :
                      severity === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {count}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Audit Trail Summary</CardTitle>
                <CardDescription>
                  Security events are automatically logged and monitored for patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Authentication Events:</span>
                    <span className="font-medium">{metrics.eventsByType.authentication || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Access Events:</span>
                    <span className="font-medium">{metrics.eventsByType.data_access || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modification Events:</span>
                    <span className="font-medium">{metrics.eventsByType.data_modification || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authorization Events:</span>
                    <span className="font-medium">{metrics.eventsByType.authorization || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};