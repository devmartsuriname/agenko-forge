import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';

export function AdminHeader() {
  const { user, userRole } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Admin Panel</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
              {userRole}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}