import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ExternalLink, MapPin, Clock, Users, Mail, CheckCircle } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  slug: string;
  team?: string;
  location?: string;
  work_mode?: string;
  type?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  apply_url?: string;
  email?: string;
  status: string;
  published_at?: string;
}

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchJob();
    }
  }, [slug]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('slug', slug)
        .in('status', ['open', 'closed'])
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
      } else {
        setJob(data);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !job) {
    return <Navigate to="/careers" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.published_at,
    "employmentType": job.type?.toUpperCase(),
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Devmart",
      "sameAs": "https://devmart.sr"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location
      }
    },
    "workHours": job.work_mode,
    "responsibilities": job.responsibilities,
    "qualifications": job.requirements,
    "benefits": job.benefits
  };

  const isJobClosed = job.status === 'closed';

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{job.title} | Careers | Devmart</title>
        <meta name="description" content={job.description} />
        <meta property="og:title" content={`${job.title} | Devmart Careers`} />
        <meta property="og:description" content={job.description} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  {job.team && <Badge variant="outline">{job.team}</Badge>}
                  {job.type && <Badge variant="secondary">{job.type}</Badge>}
                  <Badge variant={isJobClosed ? "destructive" : "default"}>
                    {isJobClosed ? "Position Closed" : "Now Hiring"}
                  </Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {job.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                  {job.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.work_mode && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>{job.work_mode}</span>
                    </div>
                  )}
                  {job.team && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>{job.team} Team</span>
                    </div>
                  )}
                </div>

                {job.description && (
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {job.description}
                  </p>
                )}

                {/* Apply Button */}
                {!isJobClosed && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {job.apply_url && (
                      <Button size="lg" asChild>
                        <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                          Apply Now
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {job.email && (
                      <Button variant="outline" size="lg" asChild>
                        <a href={`mailto:${job.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Email Application
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Job Details */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-1 gap-12">
              
              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Key Responsibilities</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {job.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Requirements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {job.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>What We Offer</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Apply CTA */}
        {!isJobClosed && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <h2 className="text-3xl font-bold">
                  Ready to Join Our Team?
                </h2>
                <p className="text-xl text-muted-foreground">
                  We're excited to hear from you and learn more about what you can bring to our team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {job.apply_url && (
                    <Button size="lg" asChild>
                      <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                        Apply Now
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {job.email && (
                    <Button variant="outline" size="lg" asChild>
                      <a href={`mailto:${job.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Your Application
                      </a>
                    </Button>
                  )}
                </div>
                <div className="text-center">
                  <Button variant="ghost" asChild>
                    <a href="/careers">← View All Opportunities</a>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}