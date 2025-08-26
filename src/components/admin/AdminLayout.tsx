import { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children?: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, userRole } = useAuth();
  const location = useLocation();

  // Dev-only observability hooks
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.info('[build] P7-RLS-AUDIT-v1');
      if (user) {
        console.info('[whoami]', { email: user.email, role: userRole });
      }
    }
  }, [user, userRole]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user has admin access (admin, editor, or viewer)
  if (!userRole || !['admin', 'editor', 'viewer'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root min-h-screen bg-background" data-build="P71-BLOG-FAQ-v1" data-audit="P7-RLS-AUDIT-v1">
      {/* Debug audit banner */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1 text-xs text-yellow-700 dark:text-yellow-300">
          🔐 Security & RLS Audit Mode - P7-RLS-AUDIT-v1
        </div>
      )}
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6 relative">
            {children || <Outlet />}
            <div className="fixed bottom-2 right-2 text-xs text-muted-foreground/50 pointer-events-none">
              v:P7-RLS-AUDIT-v1
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}