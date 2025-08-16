import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/lib/seo';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRegister() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bootstrapCode, setBootstrapCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState<boolean | null>(null);

  // Check if registration is enabled
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('is_registration_enabled');
        if (error) {
          console.error('Error checking registration status:', error);
          setRegistrationEnabled(false);
        } else {
          setRegistrationEnabled(data);
        }
      } catch (err) {
        console.error('Failed to check registration status:', err);
        setRegistrationEnabled(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/admin" replace />;
  }

  // Show disabled state if registration is not enabled
  if (registrationEnabled === false) {
    return <Navigate to="/admin/login" replace />;
  }

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !bootstrapCode) {
      setError('All fields are required');
      return false;
    }

    if (!email.toLowerCase().endsWith('@devmart.sr')) {
      setError('Only @devmart.sr email addresses are allowed');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke('admin-register', {
        body: {
          email,
          password,
          bootstrapCode
        }
      });

      if (response.error) {
        setError(response.error.message || 'Registration failed');
        return;
      }

      if (response.data?.error) {
        setError(response.data.error);
        return;
      }

      if (response.data?.success) {
        setSuccess(true);
        toast.success('Admin account created successfully! Registration has been disabled.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || registrationEnabled === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <>
        <SEOHead 
          title="Registration Complete - Devmart"
          description="Admin registration completed successfully"
        />
        
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">Registration Complete</CardTitle>
              <CardDescription>
                Your admin account has been created successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Admin registration has been automatically disabled for security. 
                  You can now log in with your new credentials.
                </AlertDescription>
              </Alert>
              
              <Button asChild className="w-full">
                <a href="/admin/login">Continue to Login</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Admin Registration - Devmart"
        description="Restricted admin registration for Devmart staff only"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Registration</CardTitle>
            <CardDescription>
              Restricted registration. Devmart staff only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="your.name@devmart.sr"
                />
                <p className="text-xs text-muted-foreground">
                  Only @devmart.sr email addresses are allowed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="At least 8 characters"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Confirm your password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bootstrapCode">Bootstrap Code *</Label>
                <Input
                  id="bootstrapCode"
                  type="password"
                  value={bootstrapCode}
                  onChange={(e) => setBootstrapCode(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="One-time bootstrap code"
                />
                <p className="text-xs text-muted-foreground">
                  Contact your administrator for the bootstrap code
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Admin Account'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/admin/login" className="text-primary hover:underline">
                  Sign in here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}