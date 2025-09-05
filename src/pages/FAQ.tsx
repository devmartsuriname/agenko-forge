import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { SEOHead } from '@/lib/seo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';
import { HelpCircle, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { FAQ } from '@/types/content';

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: faqs = [], isLoading, error } = useQuery({
    queryKey: ['faqs'],
    queryFn: async (): Promise<FAQ[]> => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        status: item.status as 'draft' | 'published'
      }));
    }
  });

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [faqs, searchQuery]);

  // Generate FAQ structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  if (isLoading) {
    return (
      <>
        <GlobalNavigation overlay={false} />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-96 mx-auto mb-4" />
              <Skeleton className="h-6 w-[600px] mx-auto" />
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {[...Array(5)].map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <GlobalNavigation overlay={false} />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">Error Loading FAQs</h1>
            <p className="text-muted-foreground">
              We're having trouble loading the FAQ content. Please try again later.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Frequently Asked Questions - Devmart"
        description="Find answers to common questions about our digital agency services, project process, pricing, and more."
        url="https://devmart.sr/faq"
        structuredData={structuredData}
      />
      
      <GlobalNavigation overlay={false} />
      
      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-8">
          <AutoBreadcrumb />
        </div>
        
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex items-center justify-center mb-6">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-primary/20 bg-primary/5 text-primary">
                Help Center
              </Badge>
            </div>
            <div className="flex items-center justify-center mb-6">
              <HelpCircle className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Frequently Asked{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Questions
                </span>
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our services, development process, pricing, 
              and how we can help transform your business with cutting-edge solutions.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Search Box */}
              {faqs.length > 0 && (
                <div className="mb-8">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {searchQuery && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} found for "{searchQuery}"
                    </p>
                  )}
                </div>
              )}

              {faqs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No FAQs Available</h3>
                    <p className="text-muted-foreground">
                      We're working on adding frequently asked questions. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              ) : filteredFaqs.length === 0 && searchQuery ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No FAQs Found</h3>
                    <p className="text-muted-foreground">
                      No FAQs match your search. Try different keywords.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="single" collapsible className="space-y-6">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem 
                      key={faq.id} 
                      value={`item-${index}`}
                      className="border border-border/50 rounded-lg px-6 bg-card/50 backdrop-blur-sm data-[state=open]:bg-accent/10 data-[state=open]:border-primary/20 transition-all duration-200 hover:border-primary/30"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-6 group">
                        <span className="text-lg font-semibold pr-4 group-hover:text-primary transition-colors">
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 text-muted-foreground">
                        <div 
                          className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground"
                          dangerouslySetInnerHTML={{ 
                            __html: faq.answer.replace(/\n/g, '<br />') 
                          }} 
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Still Have{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Questions?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Can't find the answer you're looking for? We're here to help. 
              Get in touch with our team for personalized assistance and expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-semibold hover:scale-105"
              >
                Contact Us
              </a>
              <a
                href="/get-quote"
                className="inline-flex items-center justify-center px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-all duration-200 font-semibold hover:scale-105"
              >
                Get a Quote
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}