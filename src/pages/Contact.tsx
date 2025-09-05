import React, { useState, useEffect } from 'react';
import { SEOHead } from '@/lib/seo';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutoBreadcrumb } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useContactSettings } from '@/hooks/useContactSettings';
import { MapEmbed } from '@/components/ui/MapEmbed';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { settings: contactSettings, loading: contactLoading } = useContactSettings();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || undefined,
          message: formData.message.trim(),
        },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. We'll get back to you soon!",
      });

    } catch (error: any) {
      console.error('Contact form error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please try again in a minute.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error sending message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle pre-filled subject from query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    if (subject) {
      setFormData(prev => ({ ...prev, subject }));
    }
  }, []);

  return (
    <>
      <SEOHead 
        title="Contact Us - Devmart"
        description="Get in touch with Devmart. Let's discuss your next technology project and how we can help drive your digital transformation."
        keywords={['contact devmart', 'technology consultation', 'get quote', 'business inquiry']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <GlobalNavigation overlay={false} />
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-8">
          <AutoBreadcrumb />
        </div>
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-16">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-agenko-green/20 bg-agenko-green/5 text-agenko-green">
                Contact Us
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
              Let's Start Your{' '}
              <span className="bg-gradient-to-r from-agenko-green to-agenko-green-hover bg-clip-text text-transparent">
                Next Project
              </span>
            </h1>
            <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-12 leading-relaxed">
              Ready to transform your business with innovative digital solutions? Get in touch with our team today 
              and let's discuss how we can help you achieve your goals.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                {isSuccess ? (
                  <Card className="bg-agenko-dark-lighter border-agenko-green/20">
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="w-16 h-16 text-agenko-green mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-agenko-white mb-4">
                        Thank You!
                      </h3>
                      <p className="text-agenko-gray-light mb-6">
                        Your message has been sent successfully. We'll get back to you within 24 hours.
                      </p>
                      <Button 
                        variant="outline-green" 
                        onClick={() => setIsSuccess(false)}
                      >
                        Send Another Message
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-agenko-dark-lighter border-agenko-gray/20">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-agenko-white mb-6">
                        Send us a message
                      </h2>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-agenko-white mb-2">
                              Name *
                            </label>
                            <Input
                              id="name"
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className={`bg-agenko-dark border-agenko-gray text-agenko-white placeholder:text-agenko-gray ${
                                errors.name ? 'border-red-500' : ''
                              }`}
                              placeholder="Your full name"
                              disabled={isSubmitting}
                            />
                            {errors.name && (
                              <p className="text-red-400 text-sm mt-1 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-agenko-white mb-2">
                              Email *
                            </label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className={`bg-agenko-dark border-agenko-gray text-agenko-white placeholder:text-agenko-gray ${
                                errors.email ? 'border-red-500' : ''
                              }`}
                              placeholder="your@email.com"
                              disabled={isSubmitting}
                            />
                            {errors.email && (
                              <p className="text-red-400 text-sm mt-1 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-agenko-white mb-2">
                            Subject
                          </label>
                          <Input
                            id="subject"
                            type="text"
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className="bg-agenko-dark border-agenko-gray text-agenko-white placeholder:text-agenko-gray"
                            placeholder="What can we help you with?"
                            disabled={isSubmitting}
                          />
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-agenko-white mb-2">
                            Message *
                          </label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            className={`bg-agenko-dark border-agenko-gray text-agenko-white placeholder:text-agenko-gray min-h-32 ${
                              errors.message ? 'border-red-500' : ''
                            }`}
                            placeholder="Tell us about your project, goals, and how we can help..."
                            disabled={isSubmitting}
                          />
                          {errors.message && (
                            <p className="text-red-400 text-sm mt-1 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.message}
                            </p>
                          )}
                        </div>

                        <Button 
                          type="submit" 
                          variant="hero" 
                          size="lg" 
                          disabled={isSubmitting}
                          className="w-full md:w-auto"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <Card className="bg-agenko-dark-lighter border-agenko-gray/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-agenko-white mb-6">
                      Get in Touch
                    </h3>
                    {contactLoading ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-agenko-gray/20 rounded"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-agenko-gray/20 rounded w-16"></div>
                            <div className="h-3 bg-agenko-gray/20 rounded w-32"></div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-agenko-gray/20 rounded"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-agenko-gray/20 rounded w-16"></div>
                            <div className="h-3 bg-agenko-gray/20 rounded w-32"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Mail className="w-5 h-5 text-agenko-green mt-1" />
                          <div>
                            <p className="text-agenko-white font-medium">Email</p>
                            <p className="text-agenko-gray-light text-sm">{contactSettings.contact_email}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Phone className="w-5 h-5 text-agenko-green mt-1" />
                          <div>
                            <p className="text-agenko-white font-medium">Phone</p>
                            <p className="text-agenko-gray-light text-sm">{contactSettings.contact_phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-agenko-green mt-1" />
                          <div>
                            <p className="text-agenko-white font-medium">Address</p>
                            <p className="text-agenko-gray-light text-sm">
                              {contactSettings.contact_address?.split('\n').map((line, index) => (
                                <span key={index}>
                                  {line}
                                  {index < (contactSettings.contact_address?.split('\n').length || 1) - 1 && <br />}
                                </span>
                              ))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-agenko-green mt-1" />
                          <div>
                            <p className="text-agenko-white font-medium">Hours</p>
                            <p className="text-agenko-gray-light text-sm">
                              {contactSettings.business_hours}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-agenko-dark-lighter border-agenko-gray/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-agenko-white mb-4">
                      Quick Response
                    </h3>
                    <p className="text-agenko-gray-light text-sm mb-4">
                      We typically respond to all inquiries within 24 hours. For urgent matters, please call us directly.
                    </p>
                    <div className="text-agenko-green text-sm font-medium">
                      Average response time: 2-4 hours
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-agenko-white mb-6">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: "How long does a typical project take?",
                  a: "Project timelines vary based on scope and complexity. Simple websites take 2-4 weeks, while comprehensive digital marketing campaigns can take 3-6 months to fully implement."
                },
                {
                  q: "Do you offer ongoing support and maintenance?",
                  a: "Yes, we provide ongoing support, maintenance, and optimization services to ensure your digital assets continue to perform at their best."
                },
                {
                  q: "What industries do you work with?",
                  a: "We work with businesses across various industries including technology, healthcare, finance, retail, and professional services."
                },
                {
                  q: "Can you help with both strategy and execution?",
                  a: "Absolutely! We offer comprehensive services from strategic planning and consulting to full execution and ongoing optimization."
                }
              ].map((faq, index) => (
                <Card key={index} className="bg-agenko-dark-lighter border-agenko-gray/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-agenko-white mb-3">
                      {faq.q}
                    </h3>
                    <p className="text-agenko-gray-light">
                      {faq.a}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Visit Our Office</h2>
              <p className="text-lg text-muted-foreground">
                Located in the heart of Paramaribo, we're always ready to meet in person.
              </p>
            </div>
            
            <MapEmbed 
              address="Paramaribo, Suriname"
              height="400px"
              className="rounded-lg shadow-lg"
              embedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31789.923456789!2d-55.203611!3d5.8333333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8d8b7d7d7d7d7d7d%3A0x7d7d7d7d7d7d7d7d!2sParamaribo%2C%20Suriname!5e0!3m2!1sen!2ssr!4v1234567890"
              directionsUrl="https://www.google.com/maps/dir/?api=1&destination=Paramaribo,Suriname"
            />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Contact;