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
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";
import { FAQ } from "./pages/FAQ";

// Public proposal pages
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
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:slug" element={<ProjectDetail />} />
              <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/category/:slug" element={<BlogCategory />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/faq" element={<FAQ />} />
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
