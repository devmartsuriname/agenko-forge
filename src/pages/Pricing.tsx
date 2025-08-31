import { SEOHead } from '@/lib/seo';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$2,999',
      period: 'one-time',
      description: 'Perfect for small businesses getting started with digital marketing',
      features: [
        'Website Design & Development',
        'Basic SEO Setup',
        'Google Analytics Integration',
        'Mobile Responsive Design',
        'Content Management System',
        '30 Days Support',
        '3 Revision Rounds'
      ],
      cta: 'Get Started',
      popular: false,
      subject: 'Starter Package Inquiry'
    },
    {
      name: 'Business',
      price: '$5,999',
      period: 'one-time',
      description: 'Comprehensive solution for growing businesses',
      features: [
        'Everything in Starter',
        'Advanced SEO Optimization',
        'Social Media Integration',
        'E-commerce Functionality',
        'Brand Identity Design',
        '90 Days Support',
        '5 Revision Rounds',
        'Marketing Strategy Consultation'
      ],
      cta: 'Choose Business',
      popular: true,
      subject: 'Business Package Inquiry'
    },
    {
      name: 'Pro',
      price: '$9,999',
      period: 'one-time',
      description: 'Advanced solution for established businesses',
      features: [
        'Everything in Business',
        'Custom Web Application',
        'Advanced Analytics Setup',
        'Marketing Automation',
        'Performance Optimization',
        '6 Months Support',
        'Unlimited Revisions',
        'Dedicated Account Manager'
      ],
      cta: 'Go Pro',
      popular: false,
      subject: 'Pro Package Inquiry'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'quote',
      description: 'Tailored solutions for large organizations',
      features: [
        'Everything in Pro',
        'Custom Development',
        'Multi-site Management',
        'Enterprise Security',
        'API Integrations',
        '1 Year Support',
        'Priority Support',
        'Quarterly Strategy Reviews'
      ],
      cta: 'Contact Sales',
      popular: false,
      subject: 'Enterprise Package Inquiry'
    }
  ];

  const faqs = [
    {
      question: 'What\'s included in the support period?',
      answer: 'Our support includes bug fixes, minor content updates, technical assistance, and guidance on using your new digital assets. We\'re here to ensure your success.'
    },
    {
      question: 'Can I upgrade my plan later?',
      answer: 'Absolutely! You can upgrade your plan at any time. We\'ll work with you to implement additional features and capabilities as your business grows.'
    },
    {
      question: 'Do you offer payment plans?',
      answer: 'Yes, we offer flexible payment plans for all packages. Typically, we require 50% upfront and 50% upon completion, but we can discuss custom arrangements.'
    },
    {
      question: 'What if I need custom features?',
      answer: 'We love custom projects! If you need specific functionality not covered in our standard packages, we\'ll provide a custom quote based on your requirements.'
    },
    {
      question: 'How long does each project take?',
      answer: 'Starter projects typically take 2-4 weeks, Business projects 4-6 weeks, Pro projects 6-8 weeks, and Enterprise projects vary based on scope and complexity.'
    },
    {
      question: 'Do you provide ongoing maintenance?',
      answer: 'Yes, we offer ongoing maintenance and support packages after your initial support period ends. This includes updates, backups, security monitoring, and content management.'
    }
  ];

  return (
    <>
      <SEOHead 
        title="Pricing - Devmart"
        description="Choose the perfect technology solution package for your business. From startup innovation to enterprise transformation, we have plans to fit every budget and requirement."
        keywords={['pricing', 'technology packages', 'innovation cost', 'solution plans']}
      />
      
      <div className="min-h-screen bg-agenko-dark">
        <Navigation />
        
        {/* Hero Section */}
        <section className="py-32 px-4 pt-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-agenko-dark-lighter rounded-full text-agenko-green text-sm font-medium mb-6">
              Pricing Plans
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-agenko-white leading-tight mb-6">
              Choose Your <span className="text-gradient">Perfect Plan</span>
            </h1>
            <p className="text-xl text-agenko-gray-light max-w-3xl mx-auto mb-12">
              We offer transparent, value-driven pricing for businesses of all sizes. No hidden fees, no surprises – just exceptional digital solutions that deliver results.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, index) => (
                <Card 
                  key={plan.name} 
                  className={`relative bg-agenko-dark-lighter border-agenko-gray/20 transition-all duration-300 hover:border-agenko-green/20 ${
                    plan.popular ? 'ring-2 ring-agenko-green scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-agenko-green text-agenko-dark px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-agenko-white mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-agenko-green">{plan.price}</span>
                        {plan.period !== 'quote' && (
                          <span className="text-agenko-gray-light text-sm ml-2">/{plan.period}</span>
                        )}
                      </div>
                      <p className="text-agenko-gray-light text-sm">{plan.description}</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-agenko-green mt-0.5 flex-shrink-0" />
                          <span className="text-agenko-gray-light text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-3">
                      <Link to={`/get-quote?service=${encodeURIComponent(plan.name.toLowerCase())}&budget=${encodeURIComponent(plan.price === 'Custom' ? 'not-sure' : plan.price.replace('$', '').replace(',', ''))}`}>
                        <Button 
                          variant={plan.popular ? "hero" : "outline-green"} 
                          className="w-full"
                          size="lg"
                        >
                          Get Quote for {plan.name}
                        </Button>
                      </Link>
                      <Link to={`/contact?subject=${encodeURIComponent(plan.subject)}`}>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          size="sm"
                        >
                          Contact Sales
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-agenko-white mb-6">
                Why Choose Agenko?
              </h2>
              <p className="text-agenko-gray-light max-w-3xl mx-auto">
                Every package includes our commitment to excellence and proven results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-agenko-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-agenko-dark text-2xl font-bold">25+</span>
                </div>
                <h3 className="text-xl font-bold text-agenko-white mb-4">Years Experience</h3>
                <p className="text-agenko-gray-light">
                  Over two decades of digital marketing expertise and proven success stories.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-agenko-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-agenko-dark text-2xl font-bold">98%</span>
                </div>
                <h3 className="text-xl font-bold text-agenko-white mb-4">Client Satisfaction</h3>
                <p className="text-agenko-gray-light">
                  Exceptional results and dedicated support that keeps our clients coming back.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-agenko-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-agenko-dark text-2xl font-bold">24/7</span>
                </div>
                <h3 className="text-xl font-bold text-agenko-white mb-4">Support Available</h3>
                <p className="text-agenko-gray-light">
                  Round-the-clock support during your project and throughout the support period.
                </p>
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
              <p className="text-agenko-gray-light">
                Have questions? We have answers. If you don't see what you're looking for, feel free to contact us.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-agenko-dark-lighter border-agenko-gray/20">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-agenko-white mb-4">
                      {faq.question}
                    </h3>
                    <p className="text-agenko-gray-light leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-agenko-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-agenko-gray-light text-xl mb-8">
              Let's discuss your project and find the perfect solution for your business needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-quote">
                <Button variant="hero" size="lg" className="text-lg px-12 py-6">
                  Get Free Quote
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline-green" size="lg" className="text-lg px-12 py-6">
                  Schedule Consultation
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="outline" size="lg" className="text-lg px-12 py-6">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;