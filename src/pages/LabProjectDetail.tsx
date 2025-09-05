import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { DemoShowcase } from '@/components/ui/DemoShowcase';
import { ExternalLink, Github, Play, Star } from 'lucide-react';

interface LabProject {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  demo_url?: string;
  repo_url?: string;
  hero_image?: string;
  tags?: string[];
  body?: string;
  status: string;
  published_at?: string;
}

export default function LabProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<LabProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_projects')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
      } else {
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching lab project:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNavigation overlay={false} />
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

  if (notFound || !project) {
    return <Navigate to="/innovation-lab" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.summary,
    "author": {
      "@type": "Organization",
      "name": "Devmart"
    },
    "datePublished": project.published_at,
    "image": project.hero_image,
    "keywords": project.tags?.join(", "),
    "url": project.demo_url,
    "codeRepository": project.repo_url
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{project.title} | Innovation Lab | Devmart</title>
        <meta name="description" content={project.summary} />
        <meta property="og:title" content={`${project.title} | Devmart Innovation Lab`} />
        <meta property="og:description" content={project.summary} />
        <meta property="og:type" content="article" />
        {project.hero_image && <meta property="og:image" content={project.hero_image} />}
        <meta property="article:published_time" content={project.published_at} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <GlobalNavigation overlay={false} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="flex items-center justify-center">
                <Badge variant="outline" className="text-sm">
                  <Star className="h-3 w-3 mr-1" />
                  Innovation Lab
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {project.title}
              </h1>
              
              {project.summary && (
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  {project.summary}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {project.demo_url && (
                  <Button size="lg" asChild>
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                      <Play className="mr-2 h-4 w-4" />
                      View Demo
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
                {project.repo_url && (
                  <Button variant="outline" size="lg" asChild>
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      View Source
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Hero Image */}
        {project.hero_image && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <img
                  src={project.hero_image}
                  alt={project.title}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </section>
        )}

        {/* Interactive Demo Showcase */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <DemoShowcase
                title={project.title}
                description="Experience our innovation in action through this interactive demonstration."
                demoUrl={project.demo_url}
                repoUrl={project.repo_url}
                posterImage={project.hero_image}
                embedType="iframe"
                embedUrl={project.demo_url}
                tags={project.tags || []}
              />
            </div>
          </div>
        </section>

        {/* Project Content */}
        {project.body && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {project.body.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-6 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold">
                Interested in Similar Innovation?
              </h2>
              <p className="text-xl text-muted-foreground">
                Let's explore how experimental technologies and innovative approaches can benefit your project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <a href="/get-quote">Start Your Project</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/innovation-lab">Explore More Projects</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}