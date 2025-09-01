import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/lib/auth';
import { Suspense, lazy } from 'react';
import { Spinner } from "@/components/ui/spinner";
import { GlobalIntegrations } from "@/components/GlobalIntegrations";
import { CTAProvider } from "@/components/cta/CTAProvider";

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
import { AdminErrorBoundary } from "./components/admin/ErrorBoundary";

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

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalIntegrations />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CTAProvider>
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
              <Route path="/admin/login" element={
                <Suspense fallback={<Spinner />}>
                  <AdminLogin />
                </Suspense>
              } />
              <Route path="/admin/register" element={
                <Suspense fallback={<Spinner />}>
                  <AdminRegister />
                </Suspense>
              } />
              <Route path="/admin" element={
                <AdminErrorBoundary>
                  <AdminLayout />
                </AdminErrorBoundary>
              }>
                <Route index element={
                  <Suspense fallback={<Spinner />}>
                    <AdminDashboard />
                  </Suspense>
                } />
                <Route path="pages" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminPages />
                  </Suspense>
                } />
                <Route path="pages/new" element={
                  <Suspense fallback={
                    <div>
                      <div style={{ display: 'none' }}>Loading AdminPageEditor...</div>
                      <Spinner />
                    </div>
                  }>
                    <AdminPageEditor />
                  </Suspense>
                } />
                <Route path="pages/:id/edit" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminPageEditor />
                  </Suspense>
                } />
                <Route path="services" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminServices />
                  </Suspense>
                } />
                <Route path="services/new" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminServiceEditor />
                  </Suspense>
                } />
                <Route path="services/:id/edit" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminServiceEditor />
                  </Suspense>
                } />
                <Route path="projects" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminProjects />
                  </Suspense>
                } />
                <Route path="projects/new" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminProjectEditor />
                  </Suspense>
                } />
                <Route path="projects/:id/edit" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminProjectEditor />
                  </Suspense>
                } />
                <Route path="blog" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminBlog />
                  </Suspense>
                } />
                <Route path="blog/new" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminBlogEditor />
                  </Suspense>
                } />
                <Route path="blog/edit/:id" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminBlogEditor />
                  </Suspense>
                } />
                <Route path="blog/categories" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminBlogCategories />
                  </Suspense>
                } />
                <Route path="faq" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminFAQ />
                  </Suspense>
                } />
                <Route path="case-studies" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminCaseStudies />
                  </Suspense>
                } />
                <Route path="case-studies/new" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminCaseStudyEditor />
                  </Suspense>
                } />
                <Route path="case-studies/:id/edit" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminCaseStudyEditor />
                  </Suspense>
                } />
                <Route path="innovation-lab" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminInnovationLab />
                  </Suspense>
                } />
                <Route path="innovation-lab/new" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminInnovationLabEditor />
                  </Suspense>
                } />
                <Route path="innovation-lab/:id/edit" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminInnovationLabEditor />
                  </Suspense>
                } />
                <Route path="careers" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminCareers />
                  </Suspense>
                } />
                <Route path="careers/new" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminCareerEditor />
                  </Suspense>
                } />
                <Route path="careers/:id/edit" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminCareerEditor />
                  </Suspense>
                } />
                <Route path="clients" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminClients />
                  </Suspense>
                } />
                <Route path="media" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminMedia />
                  </Suspense>
                } />
                <Route path="contact" element={
                  <Suspense fallback={<Spinner />}>
                    <ContactSubmissions />
                  </Suspense>
                } />
                <Route path="settings" element={
                  <Suspense fallback={<Spinner />}>
                    <Settings />
                  </Suspense>
                } />
                <Route path="users" element={
                  <Suspense fallback={<Spinner />}>
                    <Users />
                  </Suspense>
                } />
                <Route path="quotes" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminQuotes />
                  </Suspense>
                } />
                <Route path="payments" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminPayments />
                  </Suspense>
                } />
                <Route path="proposals" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminProposals />
                  </Suspense>
                } />
                <Route path="test-harness" element={
                  <Suspense fallback={<Spinner />}>
                    <AdminTestHarness />
                  </Suspense>
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
);

export default App;
