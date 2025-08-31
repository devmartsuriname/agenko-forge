import { NavLink } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
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
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/pages', icon: FileText, label: 'Pages' },
  { href: '/admin/services', icon: Briefcase, label: 'Services' },
  { href: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { 
    href: '/admin/blog', 
    icon: PenTool, 
    label: 'Blog',
    subItems: [
      { href: '/admin/blog/categories', icon: Tags, label: 'Categories', editorOnly: true }
    ]
  },
  { href: '/admin/faq', icon: FileQuestion, label: 'FAQ', editorOnly: true },
  { href: '/admin/quotes', icon: MessageCircle, label: 'Quotes', editorOnly: true },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments', editorOnly: true },
  { href: '/admin/proposals', icon: ProposalIcon, label: 'Proposals', editorOnly: true },
  { href: '/admin/clients', icon: Users, label: 'Clients', editorOnly: true },
  { href: '/admin/media', icon: Image, label: 'Media' },
  { href: '/admin/contact', icon: MessageSquare, label: 'Contact Submissions' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
  { href: '/admin/users', icon: Users, label: 'Users', adminOnly: true },
  // E2E Test Harness - only show if explicitly enabled via env var
  ...(import.meta.env.VITE_E2E_SIDEBAR === 'true' ? [
    { href: '/admin/test-harness', icon: TestTube, label: 'E2E Test Harness', adminOnly: true }
  ] : []),
];

export function AdminSidebar() {
  const { signOut, isAdmin, userRole, loading } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/admin/blog']);
  
  // Use userRole from auth context (fetched from profiles table)
  // Fix: Don't use user?.role as it's always undefined
  const isEditor = userRole === 'editor' || userRole === 'admin';

  const handleSignOut = async () => {
    await signOut();
  };

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
        <div key={item.href} className={cn(
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
    const isExpanded = expandedItems.includes(item.href);

    if (hasSubItems) {
      return (
        <div key={item.href}>
          <div className="flex items-center">
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
            <button
              onClick={() => toggleExpanded(item.href)}
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
              {item.subItems.map((subItem: any) => renderNavItem(subItem, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.href}
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
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => renderNavItem(item))}
      </nav>
      
      <div className="p-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}