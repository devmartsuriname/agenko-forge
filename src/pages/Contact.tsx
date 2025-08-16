import React, { useState, useEffect } from 'react';
import { SEOHead } from '@/lib/seo';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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
          // captchaToken: 'stub-token', // TODO: Add actual CAPTCHA token
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
        title="Contact Us - Agenko Digital Agency"
        description="Get in touch with Agenko Digital Agency. Let's discuss your next digital marketing project and how we can help grow your business."
        keywords={['contact agenko', 'digital marketing consultation', 'get quote', 'business inquiry']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
              Contact Us
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
              Let's Start Your <span className="text-gradient">Next Project</span>
            </h1>
            <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-12">
              Ready to transform your business with innovative digital solutions? Get in touch with our team today and let's discuss how we can help you achieve your goals.
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
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Mail className="w-5 h-5 text-agenko-green mt-1" />
                        <div>
                          <p className="text-agenko-white font-medium">Email</p>
                          <p className="text-agenko-gray-light text-sm">info@agenko.com</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-agenko-green mt-1" />
                        <div>
                          <p className="text-agenko-white font-medium">Phone</p>
                          <p className="text-agenko-gray-light text-sm">+555-759-9854</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-agenko-green mt-1" />
                        <div>
                          <p className="text-agenko-white font-medium">Address</p>
                          <p className="text-agenko-gray-light text-sm">
                            6801 Hollywood Blvd<br />
                            Los Angeles, CA 90028
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-agenko-green mt-1" />
                        <div>
                          <p className="text-agenko-white font-medium">Hours</p>
                          <p className="text-agenko-gray-light text-sm">
                            Mon - Fri: 9:00 AM - 6:00 PM PST
                          </p>
                        </div>
                      </div>
                    </div>
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

        <Footer />
      </div>
    </>
  );
};

export default Contact;