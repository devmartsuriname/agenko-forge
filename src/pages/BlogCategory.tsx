import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { SEOHead } from '@/lib/seo';
import { cms } from '@/lib/cms';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, ArrowLeft, Tag, Home } from 'lucide-react';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const BlogCategory = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['blog-category', slug],
    queryFn: () => cms.getBlogCategoryBySlug(slug!),
    enabled: !!slug,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['blog-posts-category', slug],
    queryFn: () => cms.getBlogPostsByCategory(slug!),
    enabled: !!slug,
  });

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

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-agenko-dark-lighter rounded mb-4"></div>
              <div className="h-12 bg-agenko-dark-lighter rounded mb-6"></div>
              <div className="h-4 bg-agenko-dark-lighter rounded mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-agenko-white mb-4">Category Not Found</h1>
            <p className="text-agenko-gray-light mb-8">The blog category you're looking for doesn't exist.</p>
            <Link to="/blog">
              <button className="bg-agenko-green text-agenko-dark hover:bg-agenko-green-hover font-semibold px-6 py-3 rounded-lg transition-colors">
                Back to Blog
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${category.name} Articles - Devmart Blog`}
        description={category.description || `Read the latest ${category.name.toLowerCase()} articles from Devmart. Expert insights, tips, and knowledge to help drive technology innovation.`}
        keywords={[category.name.toLowerCase(), 'blog', 'articles', 'insights']}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${category.name} Articles`,
          "description": category.description || `${category.name} articles and insights`,
          "url": typeof window !== 'undefined' ? window.location.href : '',
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": posts.length,
            "itemListElement": posts.map((post, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Article",
                "headline": post.title,
                "description": post.excerpt,
                "url": `https://agenko.lovable.app/blog/${post.slug}`
              }
            }))
          }
        }}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        
        {/* Breadcrumbs */}
        <div className="px-4 pt-24 pb-4">
          <div className="max-w-6xl mx-auto">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center text-agenko-gray-light hover:text-agenko-green">
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/blog" className="text-agenko-gray-light hover:text-agenko-green">
                    Blog
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-agenko-white">
                    {category.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-agenko-dark-lighter rounded-full mb-6">
                <Tag className="w-4 h-4 mr-2" style={{ color: category.color }} />
                <span className="text-agenko-white text-sm font-medium">Category</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
                {category.name}
              </h1>
              
              {category.description && (
                <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-8">
                  {category.description}
                </p>
              )}
              
              <p className="text-agenko-gray text-sm">
                {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {postsLoading ? (
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
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
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
                        <Badge variant="secondary" style={{ backgroundColor: category.color + '20', color: category.color }}>
                          {category.name}
                        </Badge>
                        {post.tags?.slice(0, 1).map((tag) => (
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
            ) : (
              <div className="text-center py-16">
                <p className="text-agenko-gray-light text-xl">No articles in this category yet.</p>
                <Link to="/blog" className="text-agenko-green hover:text-agenko-green-hover transition-colors mt-4 inline-block">
                  Browse all articles
                </Link>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default BlogCategory;