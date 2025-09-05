import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead, generateMetaDescription } from '@/lib/seo';
import { cms } from '@/lib/cms';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin,
  ArrowRight,
  Hash,
  Home
} from 'lucide-react';
import { ReadingProgress } from '@/components/ui/ReadingProgress';
import { useState, useEffect } from 'react';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tableOfContents, setTableOfContents] = useState<Array<{id: string, text: string, level: number}>>([]);
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => cms.getBlogPostBySlug(slug!),
    enabled: !!slug,
  });

  const { data: postCategories = [] } = useQuery({
    queryKey: ['blog-post-categories', post?.id],
    queryFn: () => cms.getBlogPostCategories(post!.id),
    enabled: !!post?.id,
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ['all-blog-posts'],
    queryFn: () => cms.getPublishedBlogPosts(),
  });

  // Get related posts based on tags
  const relatedPosts = post && allPosts.length > 0 
    ? allPosts
        .filter(p => p.id !== post.id && p.tags?.some(tag => post.tags?.includes(tag)))
        .slice(0, 3)
    : allPosts.filter(p => p.id !== post?.id).slice(0, 3);

  // Get previous and next posts by published date
  const currentIndex = allPosts.findIndex(p => p.id === post?.id);
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate table of contents from headers
  useEffect(() => {
    if (post?.body?.blocks) {
      const toc = post.body.blocks
        .filter((block: any) => block.type === 'header')
        .map((block: any, index: number) => ({
          id: `heading-${index}`,
          text: block.data.text,
          level: block.data.level || 2
        }));
      setTableOfContents(toc);
    }
  }, [post]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = post ? `Check out this article: ${post.title}` : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-agenko-dark-lighter rounded mb-4"></div>
              <div className="h-12 bg-agenko-dark-lighter rounded mb-6"></div>
              <div className="h-4 bg-agenko-dark-lighter rounded mb-2"></div>
              <div className="h-4 bg-agenko-dark-lighter rounded mb-2"></div>
              <div className="h-4 bg-agenko-dark-lighter rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-agenko-white mb-4">Post Not Found</h1>
            <p className="text-agenko-gray-light mb-8">The blog post you're looking for doesn't exist.</p>
            <Link to="/blog">
              <Button variant="cta">
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const contentText = generateMetaDescription(post.body, post.excerpt || '');

  return (
    <>
      <SEOHead 
        title={`${post.title} - Devmart Blog`}
        description={contentText}
        type="article"
        publishedAt={post.published_at || post.created_at}
        modifiedAt={post.updated_at}
        author="Devmart"
        tags={post.tags || []}
        keywords={post.tags || []}
        image={post.feature_image_url}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": contentText,
          "author": {
            "@type": "Organization",
            "name": "Devmart"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Devmart",
            "logo": {
              "@type": "ImageObject",
              "url": "https://agenko.lovable.app/logo.png"
            }
          },
          "datePublished": post.published_at || post.created_at,
          "dateModified": post.updated_at,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": typeof window !== 'undefined' ? window.location.href : ''
          },
          ...(post.feature_image_url && {
            "image": {
              "@type": "ImageObject",
              "url": post.feature_image_url,
              "width": 1200,
              "height": 630
            }
          }),
          "articleSection": postCategories.map(cat => cat.name).join(", ")
        }}
      />
      <ReadingProgress target="article" />
      
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        
        {/* Breadcrumbs */}
        <div className="px-4 pt-24 pb-4">
          <div className="max-w-4xl mx-auto">
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
                {postCategories.length > 0 && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        href={`/blog/category/${postCategories[0].slug}`} 
                        className="text-agenko-gray-light hover:text-agenko-green"
                      >
                        {postCategories[0].name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-agenko-white">
                    {post.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Feature Image */}
        {post.feature_image_url && (
          <div className="px-4 mb-8">
            <div className="max-w-4xl mx-auto">
              <img
                src={post.feature_image_url}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg"
                loading="eager"
              />
            </div>
          </div>
        )}

        {/* Hero Section */}
        <article className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {postCategories.map((category) => (
                <Link key={category.id} to={`/blog/category/${category.slug}`}>
                  <Badge 
                    variant="secondary" 
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    {category.name}
                  </Badge>
                </Link>
              ))}
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-agenko-dark-lighter text-agenko-green">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-agenko-white leading-tight mb-6">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-8 border-b border-agenko-dark-lighter">
              <div className="flex items-center space-x-6 text-agenko-gray-light text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{calculateReadingTime(post.body)} min read</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-agenko-gray-light text-sm">Share:</span>
                <div className="flex space-x-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-agenko-dark-lighter hover:bg-agenko-green hover:text-agenko-dark rounded-lg transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-agenko-dark-lighter hover:bg-agenko-green hover:text-agenko-dark rounded-lg transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-agenko-dark-lighter hover:bg-agenko-green hover:text-agenko-dark rounded-lg transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Content Section */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Table of Contents */}
              {tableOfContents.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <Card className="bg-agenko-dark-lighter border-agenko-gray/20">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-agenko-white mb-4 flex items-center">
                          <Hash className="w-5 h-5 mr-2 text-agenko-green" />
                          Table of Contents
                        </h3>
                        <nav className="space-y-2">
                          {tableOfContents.map((item) => (
                            <a
                              key={item.id}
                              href={`#${item.id}`}
                              className={`block text-sm text-agenko-gray-light hover:text-agenko-green transition-colors ${
                                item.level === 3 ? 'ml-4' : ''
                              }`}
                            >
                              {item.text}
                            </a>
                          ))}
                        </nav>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className={tableOfContents.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
                <div className="prose prose-lg prose-invert max-w-none">
                  {post.body?.blocks?.map((block: any, index: number) => {
                    switch (block.type) {
                      case 'paragraph':
                        return (
                          <p key={index} className="text-agenko-gray-light mb-6 leading-relaxed text-lg">
                            {block.data.text}
                          </p>
                        );
                      case 'header':
                        const HeadingTag = `h${block.data.level || 2}` as keyof JSX.IntrinsicElements;
                        const headingId = `heading-${index}`;
                        return (
                          <HeadingTag 
                            key={index} 
                            id={headingId}
                            className={`font-bold text-agenko-white mb-6 mt-12 ${
                              block.data.level === 2 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                            }`}
                          >
                            {block.data.text}
                          </HeadingTag>
                        );
                      case 'list':
                        return (
                          <ul key={index} className="space-y-3 mb-8 list-disc list-inside">
                            {block.data.items.map((item: string, itemIndex: number) => (
                              <li key={itemIndex} className="text-agenko-gray-light">
                                {item}
                              </li>
                            ))}
                          </ul>
                        );
                      case 'quote':
                        return (
                          <blockquote key={index} className="border-l-4 border-agenko-green pl-6 italic text-xl text-agenko-white mb-8">
                            {block.data.text}
                          </blockquote>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        {(previousPost || nextPost) && (
          <section className="py-12 px-4 border-t border-agenko-dark-lighter">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {previousPost && (
                  <Link to={`/blog/${previousPost.slug}`} className="group">
                    <Card className="bg-agenko-dark-lighter border-agenko-gray/20 hover:border-agenko-green/20 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center text-agenko-green text-sm mb-2">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous Article
                        </div>
                        <h3 className="text-lg font-semibold text-agenko-white group-hover:text-agenko-green transition-colors line-clamp-2">
                          {previousPost.title}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                )}
                
                {nextPost && (
                  <Link to={`/blog/${nextPost.slug}`} className="group">
                    <Card className="bg-agenko-dark-lighter border-agenko-gray/20 hover:border-agenko-green/20 transition-all duration-300">
                      <CardContent className="p-6 text-right">
                        <div className="flex items-center justify-end text-agenko-green text-sm mb-2">
                          Next Article
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                        <h3 className="text-lg font-semibold text-agenko-white group-hover:text-agenko-green transition-colors line-clamp-2">
                          {nextPost.title}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-agenko-white mb-12 text-center">
                Related Articles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="bg-agenko-dark-lighter border-agenko-gray/20 overflow-hidden group hover:border-agenko-green/20 transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-agenko-green/20 to-agenko-dark flex items-center justify-center">
                      <span className="text-agenko-green text-4xl font-bold">{relatedPost.title.charAt(0)}</span>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-agenko-white mb-3 line-clamp-2 group-hover:text-agenko-green transition-colors">
                        {relatedPost.title}
                      </h3>
                      
                      {relatedPost.excerpt && (
                        <p className="text-agenko-gray-light text-sm mb-4 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      )}
                      
                      <Link 
                        to={`/blog/${relatedPost.slug}`}
                        className="inline-flex items-center text-agenko-green hover:text-agenko-green-hover transition-colors"
                      >
                        Read More <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;