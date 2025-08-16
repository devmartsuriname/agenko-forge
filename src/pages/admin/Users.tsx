import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/lib/seo';
import { adminCms } from '@/lib/admin-cms';
import { useAuth } from '@/lib/auth';
import { Users as UsersIcon, Shield, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function Users() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminCms.getAllProfiles();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Prevent self-demotion from admin if user is the only admin
    if (userId === user?.id && newRole !== 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount === 1) {
        toast({
          title: 'Error',
          description: 'You cannot remove your admin role as you are the only administrator.',
          variant: 'destructive',
        });
        return;
      }
    }

    setUpdatingUser(userId);
    try {
      await adminCms.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'editor': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Only administrators can manage users.</p>
      </div>
    );
  }

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
        title="Users - Admin Panel"
        description="Manage user accounts and permissions"
      />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <UsersIcon className="h-5 w-5" />
            <span>{users.length} total users</span>
          </div>
        </div>

        {/* Role Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Role Permissions</span>
            </CardTitle>
            <CardDescription>Understanding user roles and their capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Badge variant="default">Admin</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full system access</li>
                  <li>• Can manage all content</li>
                  <li>• Can manage users</li>
                  <li>• Can change settings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Editor</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Can create/edit content</li>
                  <li>• Can view all submissions</li>
                  <li>• Cannot delete content</li>
                  <li>• Cannot manage users</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Viewer</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Read-only access</li>
                  <li>• Can view dashboard</li>
                  <li>• Cannot edit anything</li>
                  <li>• Cannot manage users</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found.</p>
            ) : (
              <div className="space-y-4">
                {users.map((userProfile) => (
                  <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{userProfile.email}</h3>
                        {userProfile.id === user?.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Joined {format(new Date(userProfile.created_at), 'MMM d, yyyy')}</span>
                        <span>Updated {format(new Date(userProfile.updated_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant={getRoleBadgeVariant(userProfile.role)}>
                        {userProfile.role}
                      </Badge>
                      
                      <Select
                        value={userProfile.role}
                        onValueChange={(newRole) => handleRoleChange(userProfile.id, newRole)}
                        disabled={updatingUser === userProfile.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {updatingUser === userProfile.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}