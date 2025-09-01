/**
 * Standardized Admin Dashboard Layout
 * Provides consistent structure for admin dashboard pages
 */

import React from 'react';
import { StandardAdminCard, AdminStatsCard } from './StandardAdminCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Download, Settings, HelpCircle } from 'lucide-react';

interface DashboardSection {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  span?: 'full' | 'half' | 'third';
  priority?: number;
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  disabled?: boolean;
}

interface AdminDashboardLayoutProps {
  title: string;
  description?: string;
  sections: DashboardSection[];
  quickActions?: QuickAction[];
  stats?: Array<{
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
      value: number;
      isPositive: boolean;
      label: string;
    };
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  loading?: boolean;
  onRefresh?: () => void;
  children?: React.ReactNode;
}

export function AdminDashboardLayout({
  title,
  description,
  sections,
  quickActions = [],
  stats = [],
  loading = false,
  onRefresh,
  children
}: AdminDashboardLayoutProps) {
  // Sort sections by priority
  const sortedSections = [...sections].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled || loading}
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <AdminStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              trend={stat.trend}
              icon={stat.icon}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {sortedSections.map((section) => {
          const colSpan = section.span === 'full' ? 'lg:col-span-12' :
                         section.span === 'half' ? 'lg:col-span-6' :
                         section.span === 'third' ? 'lg:col-span-4' :
                         'lg:col-span-8'; // default

          return (
            <div key={section.id} className={colSpan}>
              {section.content}
            </div>
          );
        })}
      </div>

      {/* Additional Content */}
      {children && (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </div>
  );
}

// Helper function to create dashboard sections
export const createDashboardSection = (
  id: string,
  title: string,
  content: React.ReactNode,
  options: {
    description?: string;
    span?: 'full' | 'half' | 'third';
    priority?: number;
  } = {}
): DashboardSection => ({
  id,
  title,
  content,
  ...options,
});

// Common dashboard patterns
export const createTableSection = (
  id: string,
  title: string,
  table: React.ReactNode,
  options: {
    description?: string;
    totalItems?: number;
    span?: 'full' | 'half' | 'third';
    priority?: number;
    onRefresh?: () => void;
    onExport?: () => void;
    onCreate?: () => void;
  } = {}
) => createDashboardSection(
  id,
  title,
  <StandardAdminCard
    title={title}
    description={options.description}
    badge={options.totalItems !== undefined ? {
      text: `${options.totalItems} items`,
      variant: 'secondary'
    } : undefined}
    actions={[
      ...(options.onRefresh ? [{
        label: 'Refresh',
        icon: RefreshCw,
        onClick: options.onRefresh,
        variant: 'outline' as const
      }] : []),
      ...(options.onExport ? [{
        label: 'Export',
        icon: Download,
        onClick: options.onExport,
        variant: 'outline' as const
      }] : []),
      ...(options.onCreate ? [{
        label: 'Create',
        icon: Plus,
        onClick: options.onCreate,
        variant: 'default' as const
      }] : []),
    ]}
  >
    {table}
  </StandardAdminCard>,
  { span: options.span, priority: options.priority }
);