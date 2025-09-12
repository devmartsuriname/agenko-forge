import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { optimizedQueryClient } from "@/lib/react-query-config";
import { CacheManagementUtils } from "@/lib/cache-management";
import { ServiceWorkerCacheManager, defaultCacheConfig } from "@/lib/service-worker-cache";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/lib/auth';
import { Suspense, lazy } from 'react';
import { SuspenseWithTimeout } from "@/components/ui/SuspenseWithTimeout";
import { Spinner } from "@/components/ui/spinner";
import { TrackingScripts } from '@/components/TrackingScripts';
import { GlobalIntegrations } from '@/components/GlobalIntegrations';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';
import { CTAProvider } from "@/components/cta/CTAProvider";
import { ProductionErrorBoundary } from "@/components/ui/ProductionErrorBoundary";
import { EnhancedProductionErrorBoundary } from "@/components/ui/EnhancedProductionErrorBoundary";

// Public pages
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Portfolio from "./pages/Portfolio";
import ProjectDetail from "./pages/ProjectDetail";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import BlogCategory from "./pages/BlogCategory";
import BlogPost from "./pages/BlogPost";
import Insights from "./pages/Insights";
import CaseStudies from "./pages/CaseStudies";
import CaseStudyDetail from "./pages/CaseStudyDetail";
import Careers from "./pages/Careers";
import JobDetail from "./pages/JobDetail";
import InnovationLab from "./pages/InnovationLab";
import LabProjectDetail from "./pages/LabProjectDetail";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";
import { FAQ } from "./pages/FAQ";
import Sitemap from "./pages/Sitemap";
import Login from "./pages/admin/Login";
import ProposalView from "./pages/ProposalView";
import ProposalAccept from "./pages/ProposalAccept";
import ProposalReject from "./pages/ProposalReject";
import GetQuote from "./pages/GetQuote";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";

// Admin layout and error boundary
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminErrorBoundary } from "./components/admin/AdminErrorBoundary";

// Admin pages - lazy loaded
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminRegister = lazy(() => import("./pages/admin/AdminRegister"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const AdminPageEditor = lazy(() => import("./pages/admin/AdminPageEditor"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminServiceEditor = lazy(() => import("./pages/admin/AdminServiceEditor"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminProjectEditor = lazy(() => import("./pages/admin/AdminProjectEditor"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const ContactSubmissions = lazy(() => import("./pages/admin/ContactSubmissions"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Users = lazy(() => import("./pages/admin/Users"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminQuotes = lazy(() => import("./pages/admin/AdminQuotes"));
const AdminProposals = lazy(() => import("./pages/admin/AdminProposals"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminBlogCategories = lazy(() => import("./pages/admin/AdminBlogCategories"));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFAQ"));
const AdminCaseStudies = lazy(() => import("./pages/admin/AdminCaseStudies"));
const AdminCaseStudyEditor = lazy(() => import("./pages/admin/AdminCaseStudyEditor"));
const AdminInnovationLab = lazy(() => import("./pages/admin/AdminInnovationLab"));
const AdminInnovationLabEditor = lazy(() => import("./pages/admin/AdminInnovationLabEditor"));
const AdminCareers = lazy(() => import("./pages/admin/AdminCareers"));
const AdminCareerEditor = lazy(() => import("./pages/admin/AdminCareerEditor"));
const AdminTestHarness = lazy(() => import("./pages/admin/TestHarness"));
const ErrorBoundaryTest = lazy(() => import("./components/admin/ErrorBoundaryTest"));
const PerformanceValidator = lazy(() => import("./components/admin/PerformanceValidator"));
const AdminNetworkDebug = lazy(() => import("./pages/admin/AdminNetworkDebug"));

// Use optimized QueryClient with content-aware caching
const queryClient = optimizedQueryClient;

// Initialize Smart Cache Management System (Phase 3)
const smartCacheManager = CacheManagementUtils.initialize(queryClient);
const serviceWorkerCache = new ServiceWorkerCacheManager(defaultCacheConfig);

// Initialize enhanced caching on app start
if (typeof window !== 'undefined') {
  // Initialize service worker cache
  serviceWorkerCache.initialize().catch(console.warn);
  
  // Preload critical assets
  setTimeout(() => {
    serviceWorkerCache.preloadCriticalResources();
    
    // Warm critical cache paths
    smartCacheManager.warmCache({
      enabled: true,
      criticalPaths: ['homepage', 'services', 'portfolio', 'about'],
      preloadDelay: 3000,
      maxConcurrent: 2
    });
  }, 1000);
  
  // Background cache optimization every 10 minutes
  setInterval(() => {
    smartCacheManager.optimizeCache();
  }, 10 * 60 * 1000);
  
  // Check for deployment updates every 5 minutes
  setInterval(() => {
    smartCacheManager.invalidateOnDeployment();
  }, 5 * 60 * 1000);
}

const App = () => (
  <EnhancedProductionErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GlobalIntegrations />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CTAProvider>
                <PWAInstallPrompt />
                <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:slug" element={<ProjectDetail />} />
              <Route path="/pricing" element={<Pricing />} />
              
              {/* Blog Routes (legacy) */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/category/:slug" element={<BlogCategory />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              
              {/* New Content Routes */}
              <Route path="/insights" element={<Insights />} />
              <Route path="/insights/:slug" element={<BlogPost />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/careers/:slug" element={<JobDetail />} />
              <Route path="/innovation-lab" element={<InnovationLab />} />
              <Route path="/innovation-lab/:slug" element={<LabProjectDetail />} />
              
              <Route path="/faq" element={<FAQ />} />
        <Route path="/sitemap.xml" element={<Sitemap />} />
        <Route path="/contact" element={<Contact />} />
              <Route path="/get-quote" element={<GetQuote />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-canceled" element={<PaymentCanceled />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin" element={
                <AdminErrorBoundary>
                  <AdminLayout />
                </AdminErrorBoundary>
              }>
                <Route index element={
                  <SuspenseWithTimeout fallback={<Spinner />} timeout={10000}>
                    <AdminDashboard />
                  </SuspenseWithTimeout>
                } />
                <Route path="pages" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminPages />
                  </SuspenseWithTimeout>
                } />
                <Route path="pages/new" element={
                  <SuspenseWithTimeout fallback={
                    <div>
                      <div style={{ display: 'none' }}>Loading AdminPageEditor...</div>
                      <Spinner />
                    </div>
                  }>
                    <AdminPageEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="pages/:id/edit" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminPageEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="services" element={
                  <SuspenseWithTimeout fallback={<Spinner />} timeout={50000}>
                    <AdminServices />
                  </SuspenseWithTimeout>
                } />
                <Route path="services/new" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminServiceEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="services/:id/edit" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminServiceEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="projects" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminProjects />
                  </SuspenseWithTimeout>
                } />
                <Route path="projects/new" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminProjectEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="projects/:id/edit" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminProjectEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="blog" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminBlog />
                  </SuspenseWithTimeout>
                } />
                <Route path="blog/new" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminBlogEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="blog/edit/:id" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminBlogEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="blog/categories" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminBlogCategories />
                  </SuspenseWithTimeout>
                } />
                <Route path="faq" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminFAQ />
                  </SuspenseWithTimeout>
                } />
                <Route path="case-studies" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminCaseStudies />
                  </SuspenseWithTimeout>
                } />
                <Route path="case-studies/new" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminCaseStudyEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="case-studies/:id/edit" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminCaseStudyEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="innovation-lab" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminInnovationLab />
                  </SuspenseWithTimeout>
                } />
                <Route path="innovation-lab/new" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminInnovationLabEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="innovation-lab/:id/edit" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminInnovationLabEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="careers" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminCareers />
                  </SuspenseWithTimeout>
                } />
                <Route path="careers/new" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminCareerEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="careers/:id/edit" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminCareerEditor />
                  </SuspenseWithTimeout>
                } />
                <Route path="clients" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminClients />
                  </SuspenseWithTimeout>
                } />
                <Route path="media" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminMedia />
                  </SuspenseWithTimeout>
                } />
                <Route path="contact" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <ContactSubmissions />
                  </SuspenseWithTimeout>
                } />
                <Route path="settings" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <Settings />
                  </SuspenseWithTimeout>
                } />
                <Route path="users" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <Users />
                  </SuspenseWithTimeout>
                } />
                <Route path="quotes" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminQuotes />
                  </SuspenseWithTimeout>
                } />
                <Route path="payments" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminPayments />
                  </SuspenseWithTimeout>
                } />
                <Route path="proposals" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminProposals />
                  </SuspenseWithTimeout>
                } />
                <Route path="test-harness" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminTestHarness />
                  </SuspenseWithTimeout>
                } />
                <Route path="error-boundary-test" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <ErrorBoundaryTest />
                  </SuspenseWithTimeout>
                } />
                <Route path="network-debug" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <AdminNetworkDebug />
                  </SuspenseWithTimeout>
                } />
                <Route path="performance-validator" element={
                  <SuspenseWithTimeout fallback={<Spinner />}>
                    <PerformanceValidator />
                  </SuspenseWithTimeout>
                } />
              </Route>
              
              {/* Public Proposal Routes */}
              <Route path="/proposal/:id/:token" element={<ProposalView />} />
              <Route path="/proposal/:id/:token/accept" element={<ProposalAccept />} />
              <Route path="/proposal/:id/:token/reject" element={<ProposalReject />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
                </Routes>
              </CTAProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </EnhancedProductionErrorBoundary>
);

export default App;
