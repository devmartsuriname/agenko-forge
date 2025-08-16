import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/lib/seo';
import { adminCms, exportToCSV } from '@/lib/admin-cms';
import { ContactSubmission } from '@/lib/cms';
import { useAuth } from '@/lib/auth';
import { Download, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactSubmissions() {
  const { isAdmin } = useAuth();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    // Filter submissions based on search term
    if (searchTerm.trim()) {
      const filtered = submissions.filter(submission =>
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubmissions(filtered);
    } else {
      setFilteredSubmissions(submissions);
    }
  }, [submissions, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      const data = await adminCms.getAllContactSubmissions();
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredSubmissions.map(submission => ({
      name: submission.name,
      email: submission.email,
      subject: submission.subject || '',
      message: submission.message,
      created_at: submission.created_at,
      ip: submission.ip || ''
    }));
    
    exportToCSV(exportData, `contact_submissions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">Only administrators can view contact submissions.</p>
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
        title="Contact Submissions - Admin Panel"
        description="Manage contact form submissions"
      />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contact Submissions</h1>
            <p className="text-muted-foreground">View and manage contact form submissions</p>
          </div>
          
          <Button onClick={handleExportCSV} disabled={filteredSubmissions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Submissions</CardTitle>
            <CardDescription>Filter submissions by name, email, subject, or message</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
            <CardDescription>All contact form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchTerm ? 'No submissions found matching your search.' : 'No submissions found.'}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{submission.name}</h3>
                          <Badge variant="outline">{submission.email}</Badge>
                        </div>
                        {submission.subject && (
                          <p className="font-medium text-sm">{submission.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {submission.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(submission.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          <div>{format(new Date(submission.created_at), 'h:mm a')}</div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact Submission Details</DialogTitle>
                              <DialogDescription>
                                Submitted on {format(new Date(submission.created_at), 'MMMM d, yyyy')} at {format(new Date(submission.created_at), 'h:mm a')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Name</label>
                                  <p className="text-sm text-muted-foreground">{submission.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p className="text-sm text-muted-foreground">{submission.email}</p>
                                </div>
                              </div>
                              
                              {submission.subject && (
                                <div>
                                  <label className="text-sm font-medium">Subject</label>
                                  <p className="text-sm text-muted-foreground">{submission.subject}</p>
                                </div>
                              )}
                              
                              <div>
                                <label className="text-sm font-medium">Message</label>
                                <div className="mt-1 p-3 bg-muted rounded-md">
                                  <p className="text-sm whitespace-pre-wrap">{submission.message}</p>
                                </div>
                              </div>
                              
                              {submission.ip && (
                                <div>
                                  <label className="text-sm font-medium">IP Address</label>
                                  <p className="text-sm text-muted-foreground">{submission.ip}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
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