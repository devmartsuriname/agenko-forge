import { NavLink } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { SecureLogout } from '@/components/auth/SecureLogout';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  FolderOpen,
  PenTool,
  Image,
  MessageSquare,
  Settings,
  Users,
  LogOut,
  FileQuestion,
  CreditCard,
  FileText as ProposalIcon,
  TestTube,
  Tags,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Beaker,
  BookOpen,
  HelpCircle,
  Building,
  Mail,
  Calculator,
  Layers
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/pages', icon: FileText, label: 'Pages' },
  { href: '/admin/services', icon: Briefcase, label: 'Services' },
  { href: '/admin/projects', icon: FolderOpen, label: 'Portfolio' },
  { 
    href: '/admin/blog', 
    icon: BookOpen, 
    label: 'Insights (Blog)',
    subItems: [
      { href: '/admin/blog/categories', icon: Tags, label: 'Categories', editorOnly: true }
    ]
  },
  {
    label: 'Core Modules',
    icon: Layers,
    editorOnly: true,
    subItems: [
      { href: '/admin/case-studies', icon: TrendingUp, label: 'Case Studies', editorOnly: true },
      { href: '/admin/careers', icon: Users, label: 'Careers', editorOnly: true },
      { href: '/admin/innovation-lab', icon: Beaker, label: 'Innovation Lab', editorOnly: true }
    ]
  },
  { href: '/admin/faq', icon: HelpCircle, label: 'FAQ', editorOnly: true },
  { href: '/admin/clients', icon: Building, label: 'Clients', editorOnly: true },
  { href: '/admin/media', icon: Image, label: 'Media' },
  { href: '/admin/contact', icon: Mail, label: 'Contact Submissions' },
  { href: '/admin/quotes', icon: Calculator, label: 'Quotes', adminOnly: true },
  { href: '/admin/proposals', icon: ProposalIcon, label: 'Proposals', editorOnly: true },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments', adminOnly: true },
  { href: '/admin/settings', icon: Settings, label: 'Settings', adminOnly: true },
  { href: '/admin/users', icon: Users, label: 'Users', adminOnly: true },
  // E2E Test Harness - only show if explicitly enabled via env var
  ...(import.meta.env.VITE_E2E_SIDEBAR === 'true' ? [
    { href: '/admin/test-harness', icon: TestTube, label: 'E2E Test Harness', adminOnly: true }
  ] : []),
];

export function AdminSidebar() {
  const { isAdmin, userRole, loading } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/admin/blog', 'Core Modules']);
  
  // Use userRole from auth context (fetched from profiles table)
  // Fix: Don't use user?.role as it's always undefined
  const isEditor = userRole === 'editor' || userRole === 'admin';

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const renderNavItem = (item: any, isSubItem = false) => {
    // Show loading skeleton while role is being fetched
    if (loading && (item.adminOnly || item.editorOnly)) {
      return (
        <div key={item.href || item.label} className={cn(
          "flex items-center space-x-3 px-3 py-2",
          isSubItem && "ml-6"
        )}>
          <div className="h-5 w-5 bg-muted animate-pulse rounded" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
      );
    }
    
    // Hide admin-only items for non-admins
    if (item.adminOnly && !isAdmin) return null;
    // Hide editor-only items for viewers
    if (item.editorOnly && !isEditor) return null;

    const hasSubItems = item.subItems && item.subItems.length > 0;
    const itemKey = item.href || item.label;
    const isExpanded = expandedItems.includes(itemKey);

    if (hasSubItems) {
      return (
        <div>
          <div className="flex items-center">
            {item.href ? (
              <NavLink
                to={item.href}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-md transition-colors flex-1',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ) : (
              <div className="flex items-center space-x-3 px-3 py-2 flex-1 text-muted-foreground">
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            )}
            <button
              onClick={() => toggleExpanded(itemKey)}
              className="p-1 rounded-md hover:bg-accent mr-2"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {isExpanded && (
            <div className="ml-4 mt-2 space-y-1">
              {item.subItems.map((subItem: any, subIndex: number) => (
                <div key={subItem.href || `subitem-${subIndex}`}>
                  {renderNavItem(subItem, true)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        to={item.href}
        end={item.exact}
        className={({ isActive }) =>
          cn(
            'flex items-center space-x-3 px-3 py-2 rounded-md transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground',
            isSubItem && 'ml-2'
          )
        }
      >
        <item.icon className="h-5 w-5" />
        <span className="font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div 
      id="admin-sidebar-main"
      className="w-64 bg-card border-r border-border h-screen flex flex-col"
      data-sidebar-version="P7-RBAC-FIX-UNIQUE"
      data-component-id={`sidebar-${Date.now()}`}
    >
      <span className="sr-only" data-sidebar-stamp="P7-RBAC-FIX" />
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Devmart Admin</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item, index) => (
          <div key={item.href || item.label || `item-${index}`}>
            {renderNavItem(item)}
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border">
        <SecureLogout
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onLogoutComplete={() => {
            // Redirect to login after successful logout
            window.location.href = '/admin/login';
          }}
          onLogoutError={(error) => {
            console.error('Logout failed:', error);
            // Still redirect to login to ensure clean state
            window.location.href = '/admin/login';
          }}
        >
          Sign Out
        </SecureLogout>
      </div>
    </div>
  );
}