import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Calendar, User } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  feature_image_url?: string;
  published_at: string;
}

const Insights = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { elementRef: heroRef, isVisible: heroVisible } = useScrollReveal();
  const { elementRef: gridRef, isVisible: gridVisible } = useScrollReveal();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('status', 'published')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Insights - Devmart</title>
        <meta name="description" content="Stay ahead with the latest insights, trends, and expert perspectives on digital innovation, technology, and business growth." />
        <meta property="og:title" content="Insights - Devmart" />
        <meta property="og:description" content="Stay ahead with the latest insights, trends, and expert perspectives on digital innovation, technology, and business growth." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://devmart.sr/insights" />
      </Helmet>

      <div className="min-h-screen bg-agenko-dark">
        <Navigation />

        <main id="main-content">
          {/* Hero Section */}
          <section 
            ref={heroRef}
            className={`relative pt-24 pb-16 px-4 transition-all duration-1000 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
                Insights & Innovation
              </h1>
              <p className="text-xl text-agenko-gray-light mb-8 max-w-2xl mx-auto">
                Stay ahead with the latest insights, trends, and expert perspectives on digital innovation, technology, and business growth.
              </p>
              
              {/* Search & Filter */}
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-agenko-gray h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search insights..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-agenko-dark-lighter border-agenko-gray text-agenko-white placeholder:text-agenko-gray"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      !selectedCategory 
                        ? 'bg-agenko-green text-agenko-dark' 
                        : 'bg-agenko-dark-lighter text-agenko-gray-light hover:bg-agenko-gray/20'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        selectedCategory === category.slug
                          ? 'bg-agenko-green text-agenko-dark'
                          : 'bg-agenko-dark-lighter text-agenko-gray-light hover:bg-agenko-gray/20'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Posts Grid */}
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
                    <div key={i} className="bg-agenko-dark-lighter rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-agenko-gray/20 rounded mb-4"></div>
                      <div className="h-20 bg-agenko-gray/20 rounded mb-4"></div>
                      <div className="h-4 bg-agenko-gray/20 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post, index) => (
                    <article 
                      key={post.id}
                      className={`group bg-agenko-dark-lighter hover:bg-agenko-dark-lighter/80 rounded-lg overflow-hidden border border-agenko-gray/20 hover:border-agenko-green/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {post.feature_image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={post.feature_image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        
                        <h3 className="text-xl font-semibold text-agenko-white mb-3 group-hover:text-agenko-green transition-colors">
                          <Link to={`/insights/${post.slug}`} className="story-link">
                            {post.title}
                          </Link>
                        </h3>
                        
                        {post.excerpt && (
                          <p className="text-agenko-gray-light mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-agenko-gray-light">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(post.published_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-agenko-green/10 text-agenko-green text-xs rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-agenko-gray-light text-lg">No insights found matching your criteria.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Insights;