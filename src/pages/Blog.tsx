import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';
import { Calendar, Clock, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { EmailCaptureModal } from '@/components/cta/EmailCaptureModal';

const Blog = () => {
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const postsPerPage = 6;
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['blog-posts', page],
    queryFn: () => cms.getPublishedBlogPostsWithCategories(),
  });

  // Simple pagination logic (in a real app, you'd implement server-side pagination)
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = blogPosts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content: any): number => {
    if (!content?.blocks) return 1;
    
    const text = content.blocks
      .filter((block: any) => block.type === 'paragraph')
      .map((block: any) => block.data?.text || '')
      .join(' ');
    
    const wordsPerMinute = 200;
    const wordCount = text.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  return (
    <>
      <SEOHead 
        title="Blog - Devmart"
        description="Read the latest insights, trends, and tips from Devmart. Stay ahead with expert knowledge in technology, innovation, and digital transformation."
        keywords={['technology blog', 'innovation insights', 'digital transformation', 'devmart insights']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-8">
          <AutoBreadcrumb />
        </div>
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-16">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-primary/20 bg-primary/5 text-primary">
                Our Blog
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
              Insights &{' '}
              <span className="bg-gradient-to-r from-agenko-green to-agenko-green-hover bg-clip-text text-transparent">
                Expert Knowledge
              </span>
            </h1>
            <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-12 leading-relaxed">
              Stay ahead with the latest trends, tips, and insights in digital marketing, web design, 
              and business growth from our team of experts.
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-agenko-dark-lighter border-agenko-gray/20">
                    <div className="aspect-video bg-agenko-gray/10 animate-pulse"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-agenko-gray/20 rounded mb-2 animate-pulse"></div>
                      <div className="h-6 bg-agenko-gray/20 rounded mb-4 animate-pulse"></div>
                      <div className="h-4 bg-agenko-gray/20 rounded w-3/4 animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : paginatedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {paginatedPosts.map((post) => (
                    <Card key={post.id} className="bg-agenko-dark-lighter border-agenko-gray/20 overflow-hidden group hover:border-agenko-green/20 transition-all duration-300">
                    {post.feature_image_url ? (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.feature_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-agenko-green/20 to-agenko-dark flex items-center justify-center">
                        <span className="text-agenko-green text-6xl font-bold">{post.title.charAt(0)}</span>
                      </div>
                    )}
                      
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 text-agenko-gray text-sm mb-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.published_at || post.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{calculateReadingTime(post.body)} min read</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {/* Display categories first as primary badges */}
                          {post.categories?.slice(0, 2).map((category) => (
                            <Link key={category.slug} to={`/blog/category/${category.slug}`}>
                              <Badge 
                                variant="secondary" 
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                                style={{ 
                                  backgroundColor: category.color + '20', 
                                  color: category.color,
                                  borderColor: category.color + '40'
                                }}
                              >
                                {category.name}
                              </Badge>
                            </Link>
                          ))}
                          {/* Display tags as secondary badges if there's room */}
                          {(!post.categories || post.categories.length === 0) && post.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-agenko-dark text-agenko-green">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <h3 className="text-xl font-bold text-agenko-white mb-3 line-clamp-2 group-hover:text-agenko-green transition-colors">
                          {post.title}
                        </h3>
                        
                        {post.excerpt && (
                          <p className="text-agenko-gray-light text-sm mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        
                        <Link 
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors"
                        >
                          Read More <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4">
                    {page > 1 && (
                      <Link 
                        to={`/blog?page=${page - 1}`}
                        className="flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Link>
                    )}
                    
                    <div className="flex space-x-2">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Link
                            key={pageNum}
                            to={`/blog?page=${pageNum}`}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              pageNum === page
                                ? 'bg-agenko-green text-agenko-dark'
                                : 'bg-agenko-dark-lighter text-agenko-gray-light hover:text-agenko-white'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}
                    </div>
                    
                    {page < totalPages && (
                      <Link 
                        to={`/blog?page=${page + 1}`}
                        className="flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-agenko-gray-light text-xl">No blog posts available yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stay Updated with Our Blog
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Get the latest tutorials, company news, and development tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Button 
                onClick={() => setShowNewsletterModal(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3"
              >
                <Mail className="h-5 w-5 mr-2" />
                Subscribe to Blog Updates
              </Button>
            </div>
          </div>
        </section>

        <Footer />

        {/* Newsletter Modal */}
        <EmailCaptureModal
          isOpen={showNewsletterModal}
          onClose={() => setShowNewsletterModal(false)}
          title="Subscribe to Devmart Blog"
          description="Get tutorials, development tips, company updates, and behind-the-scenes content delivered weekly."
          incentive="🎁 Get our free 'Web Developer's Toolkit Guide' as a welcome gift!"
          source="blog_page"
        />
      </div>
    </>
  );
};

export default Blog;