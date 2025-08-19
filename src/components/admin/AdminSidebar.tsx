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
  TestTube
} from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/pages', icon: FileText, label: 'Pages' },
  { href: '/admin/services', icon: Briefcase, label: 'Services' },
  { href: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/admin/blog', icon: PenTool, label: 'Blog' },
  { href: '/admin/quotes', icon: FileQuestion, label: 'Quotes', editorOnly: true },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments', editorOnly: true },
  { href: '/admin/proposals', icon: ProposalIcon, label: 'Proposals', editorOnly: true },
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
  
  // Use userRole from auth context (fetched from profiles table)
  // Fix: Don't use user?.role as it's always undefined
  const isEditor = userRole === 'editor' || userRole === 'admin';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div 
      className="w-64 bg-card border-r border-border h-screen flex flex-col"
      data-sidebar-version="P7-RBAC-FIX"
    >
      <span className="sr-only" data-sidebar-stamp="P7-RBAC-FIX" />
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Agenko Admin</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          // Show loading skeleton while role is being fetched
          if (loading && (item.adminOnly || item.editorOnly)) {
            return (
              <div key={item.href} className="flex items-center space-x-3 px-3 py-2">
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
            );
          }
          
          // Hide admin-only items for non-admins
          if (item.adminOnly && !isAdmin) return null;
          // Hide editor-only items for viewers
          if (item.editorOnly && !isEditor) return null;
          
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
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
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