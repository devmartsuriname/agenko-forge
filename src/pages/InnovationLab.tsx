import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Play, Beaker } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface LabProject {
  id: string;
  title: string;
  slug: string;
  summary: string;
  demo_url?: string;
  repo_url?: string;
  hero_image?: string;
  tags: string[];
  body: string;
  published_at: string;
}

const InnovationLab = () => {
  const { elementRef: heroRef, isVisible: heroVisible } = useScrollReveal();
  const { elementRef: gridRef, isVisible: gridVisible } = useScrollReveal();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['lab-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_projects')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <>
      <Helmet>
        <title>Innovation Lab - Experimental Projects | Devmart</title>
        <meta name="description" content="Explore cutting-edge experiments, AI demos, and innovative tools from Devmart's Innovation Lab. Where ideas become reality." />
        <meta property="og:title" content="Innovation Lab - Experimental Projects | Devmart" />
        <meta property="og:description" content="Explore cutting-edge experiments, AI demos, and innovative tools from Devmart's Innovation Lab. Where ideas become reality." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://devmart.sr/innovation-lab" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Innovation Lab",
            "description": "Experimental projects and AI demonstrations",
            "url": "https://devmart.sr/innovation-lab",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": projects.map((project, index) => ({
                "@type": "SoftwareApplication",
                "position": index + 1,
                "name": project.title,
                "description": project.summary,
                "url": `https://devmart.sr/innovation-lab/${project.slug}`,
                "applicationCategory": "Experimental Software"
              }))
            }
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className={`relative pt-24 pb-16 px-4 transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Beaker className="h-12 w-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Innovation Lab
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore cutting-edge experiments, AI demonstrations, and innovative tools. 
              This is where we push boundaries and turn bold ideas into reality.
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section 
          ref={gridRef}
          className={`pb-20 px-4 transition-all duration-1000 delay-200 ${
            gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-muted"></div>
                    <div className="p-6">
                      <div className="h-6 bg-muted rounded mb-4"></div>
                      <div className="h-20 bg-muted rounded mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded w-20"></div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <article 
                    key={project.id}
                    className={`group bg-card hover:bg-card/80 rounded-lg overflow-hidden border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {project.hero_image ? (
                      <div className="aspect-video overflow-hidden relative">
                        <img 
                          src={project.hero_image} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {project.demo_url && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Button size="sm" variant="secondary" className="gap-2">
                              <Play className="h-4 w-4" />
                              Try Demo
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Beaker className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                        <Link to={`/innovation-lab/${project.slug}`} className="story-link">
                          {project.title}
                        </Link>
                      </h3>
                      
                      {project.summary && (
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {project.summary}
                        </p>
                      )}

                      <div className="flex gap-2">
                        {project.demo_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a 
                              href={project.demo_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Try Demo
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        
                        {project.repo_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a 
                              href={project.repo_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <Github className="h-4 w-4" />
                              Code
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Beaker className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No experiments available yet.</p>
                <p className="text-muted-foreground mt-2">Check back soon for innovative projects and demos.</p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Interested in a Custom Pilot?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have an innovative idea or want to explore cutting-edge technology solutions? 
              Let's collaborate on your next breakthrough project.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">
                  Request a Pilot Project
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a 
                  href="https://github.com/devmart-sr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-5 w-5" />
                  Follow on GitHub
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default InnovationLab;