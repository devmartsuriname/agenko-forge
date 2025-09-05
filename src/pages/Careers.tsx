import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Users, Search, ExternalLink } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';

interface Job {
  id: string;
  title: string;
  slug: string;
  team: string;
  location: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  type: 'full-time' | 'part-time' | 'contract' | 'intern';
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  apply_url?: string;
  email?: string;
  published_at: string;
}

const Careers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  
  const { elementRef: heroRef, isVisible: heroVisible } = useScrollReveal();
  const { elementRef: gridRef, isVisible: gridVisible } = useScrollReveal();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const workModeLabels = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    onsite: 'On-site'
  };

  const typeLabels = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'intern': 'Internship'
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.team?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = locationFilter === 'all' || job.work_mode === locationFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesTeam = teamFilter === 'all' || job.team === teamFilter;

    return matchesSearch && matchesLocation && matchesType && matchesTeam;
  });

  const uniqueTeams = [...new Set(jobs.map(job => job.team).filter(Boolean))];

  return (
    <>
      <Helmet>
        <title>Careers - Join Our Team | Devmart</title>
        <meta name="description" content="Join Devmart's innovative team. Explore remote, hybrid, and on-site opportunities in technology, design, and digital transformation." />
        <meta property="og:title" content="Careers - Join Our Team | Devmart" />
        <meta property="og:description" content="Join Devmart's innovative team. Explore remote, hybrid, and on-site opportunities in technology, design, and digital transformation." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://devmart.sr/careers" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Careers",
            "description": "Job opportunities at Devmart",
            "url": "https://devmart.sr/careers",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": jobs.map((job, index) => ({
                "@type": "JobPosting",
                "position": index + 1,
                "title": job.title,
                "description": job.description,
                "employmentType": job.type.toUpperCase().replace('-', '_'),
                "hiringOrganization": {
                  "@type": "Organization",
                  "name": "Devmart"
                },
                "jobLocation": {
                  "@type": "Place",
                  "address": job.location
                },
                "url": `https://devmart.sr/careers/${job.slug}`
              }))
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />

        <main id="main-content">
          {/* Hero Section */}
          <section className="py-32 px-4 pt-24">
            <div className="max-w-6xl mx-auto text-center">
              <AutoBreadcrumb />
              <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
                Join Our Team
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
                Build Your <span className="text-gradient">Career</span>
              </h1>
              <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-12">
                Shape the future of digital innovation with us. We're looking for passionate individuals who want to make a meaningful impact.
              </p>
              
              {/* Search & Filters */}
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-agenko-gray h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search positions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-agenko-dark-lighter border-agenko-gray text-agenko-white placeholder:text-agenko-gray"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="bg-agenko-dark-lighter border-agenko-gray text-agenko-white">
                      <SelectValue placeholder="Work Mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-agenko-dark-lighter border-agenko-gray/20">
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-agenko-dark-lighter border-agenko-gray text-agenko-white">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-agenko-dark-lighter border-agenko-gray/20">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Internship</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={teamFilter} onValueChange={setTeamFilter}>
                    <SelectTrigger className="bg-agenko-dark-lighter border-agenko-gray text-agenko-white">
                      <SelectValue placeholder="Team" />
                    </SelectTrigger>
                    <SelectContent className="bg-agenko-dark-lighter border-agenko-gray/20">
                      <SelectItem value="all">All Teams</SelectItem>
                      {uniqueTeams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          {/* Jobs List */}
          <section className="pb-20 px-4">
            <div className="max-w-4xl mx-auto">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-agenko-dark-lighter rounded-lg p-6 animate-pulse">
                      <div className="h-6 bg-agenko-gray/20 rounded mb-4 w-1/2"></div>
                      <div className="h-4 bg-agenko-gray/20 rounded mb-4 w-3/4"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-agenko-gray/20 rounded w-20"></div>
                        <div className="h-6 bg-agenko-gray/20 rounded w-20"></div>
                        <div className="h-6 bg-agenko-gray/20 rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-agenko-gray/20 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="space-y-6">
                  {filteredJobs.map((job, index) => (
                    <article 
                      key={job.id}
                      className={`group bg-agenko-dark-lighter hover:bg-agenko-dark-lighter/80 rounded-lg border border-agenko-gray/20 hover:border-agenko-green/20 transition-all duration-300 hover:shadow-lg p-6 animate-fade-in`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {job.team && (
                              <Badge variant="outline" className="text-xs border-agenko-gray/20 text-agenko-gray-light">
                                <Users className="h-3 w-3 mr-1" />
                                {job.team}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs bg-agenko-green/10 text-agenko-green">
                              <Clock className="h-3 w-3 mr-1" />
                              {typeLabels[job.type]}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-agenko-green/10 text-agenko-green">
                              <MapPin className="h-3 w-3 mr-1" />
                              {workModeLabels[job.work_mode]}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-semibold text-agenko-white mb-2 group-hover:text-agenko-green transition-colors">
                            <Link to={`/careers/${job.slug}`} className="story-link">
                              {job.title}
                            </Link>
                          </h3>
                          
                          {job.location && (
                            <p className="text-agenko-gray-light text-sm mb-3">
                              📍 {job.location}
                            </p>
                          )}

                          {job.description && (
                            <p className="text-agenko-gray-light line-clamp-2">
                              {job.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                            </p>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" asChild className="border-agenko-gray/20 text-agenko-gray-light hover:border-agenko-green hover:text-agenko-green">
                            <Link to={`/careers/${job.slug}`}>
                              View Details
                            </Link>
                          </Button>
                          
                          {(job.apply_url || job.email) && (
                            <Button size="sm" variant="hero" asChild>
                              {job.apply_url ? (
                                <a 
                                  href={job.apply_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  Apply Now
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              ) : (
                                <a 
                                  href={`mailto:${job.email}?subject=Application for ${job.title}`}
                                  className="flex items-center gap-2"
                                >
                                  Apply Now
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-agenko-gray-light text-lg">No positions found matching your criteria.</p>
                  <p className="text-agenko-gray-light mt-2">Try adjusting your filters or check back later for new opportunities.</p>
                </div>
              )}
            </div>
          </section>

          {/* Company Culture CTA */}
          <section className="py-16 px-4 bg-agenko-dark-lighter/50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-agenko-white mb-4">
                Why Work at Devmart?
              </h2>
              <p className="text-agenko-gray-light mb-8 max-w-2xl mx-auto">
                Join a team that values innovation, growth, and work-life balance. We believe in empowering our people to do their best work.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-agenko-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-agenko-green" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-agenko-white">Collaborative Culture</h3>
                  <p className="text-agenko-gray-light text-sm">Work with talented individuals who share your passion for innovation.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-agenko-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-agenko-green" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-agenko-white">Flexible Work</h3>
                  <p className="text-agenko-gray-light text-sm">Remote-first culture with options for hybrid and in-person collaboration.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-agenko-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-agenko-green" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-agenko-white">Growth Opportunities</h3>
                  <p className="text-agenko-gray-light text-sm">Continuous learning and career development with industry-leading projects.</p>
                </div>
              </div>
              <Button size="lg" variant="outline" asChild className="border-agenko-gray/20 text-agenko-gray-light hover:border-agenko-green hover:text-agenko-green">
                <Link to="/contact">
                  Learn More About Our Culture
                </Link>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Careers;