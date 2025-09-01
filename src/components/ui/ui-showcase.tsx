import React, { useState } from "react";
import { cn } from "@/lib/ui-system";
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/enhanced-card";
import { ValidatedInput, ValidatedTextarea } from "@/components/ui/form-field";
import { StatusIndicator, StatusDot, ProgressStatus } from "@/components/ui/status-indicator";
import { ResponsiveGrid, AutoGrid } from "@/components/ui/responsive-grid";
import { LoadingSpinner, PageLoading, ErrorState, EmptyState, ProgressIndicator } from "@/components/ui/loading-states";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Palette, 
  Layout, 
  Zap, 
  Shield, 
  Heart,
  RefreshCw,
  Plus
} from "lucide-react";

// Component to showcase the entire design system
export const UIShowcase = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const mockProgressSteps = [
    { label: "Planning", status: "completed" as const, description: "Project scope defined" },
    { label: "Design", status: "completed" as const, description: "UI/UX completed" },
    { label: "Development", status: "current" as const, description: "In progress" },
    { label: "Testing", status: "pending" as const, description: "Awaiting development" },
    { label: "Launch", status: "pending" as const, description: "Final phase" },
  ];

  return (
    <div className="space-y-12 p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Design System Showcase</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive UI/UX patterns and components for consistent, accessible, and beautiful interfaces.
        </p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Button Variants & States
              </CardTitle>
              <CardDescription>
                Enhanced buttons with loading states, icons, and semantic variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
                <div className="space-y-4">
                  <h3 className="font-semibold">Primary Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Default</Button>
                    <Button variant="hero">Hero</Button>
                    <Button variant="cta">Call to Action</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Status Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="info">Info</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Interactive States</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button loading={loading} onClick={() => setLoading(!loading)}>
                      Toggle Loading
                    </Button>
                    <Button icon={<Plus className="h-4 w-4" />}>
                      With Icon
                    </Button>
                    <Button fullWidth>Full Width</Button>
                  </div>
                </div>
              </ResponsiveGrid>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Status Indicators & Progress
              </CardTitle>
              <CardDescription>
                Visual feedback for system states, user actions, and progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-semibold">Status Badges</h3>
                <div className="flex flex-wrap gap-3">
                  <StatusIndicator variant="success">Active</StatusIndicator>
                  <StatusIndicator variant="warning">Pending</StatusIndicator>
                  <StatusIndicator variant="error">Failed</StatusIndicator>
                  <StatusIndicator variant="info">Processing</StatusIndicator>
                  <StatusIndicator variant="neutral">Draft</StatusIndicator>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Status Dots</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <StatusDot variant="success" />
                    <span className="text-sm">Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="warning" animated />
                    <span className="text-sm">Syncing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot variant="error" />
                    <span className="text-sm">Offline</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Progress Tracking</h3>
                <ProgressStatus steps={mockProgressSteps} />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Progress Indicators</h3>
                <div className="space-y-3">
                  <ProgressIndicator progress={75} label="Upload Progress" />
                  <ProgressIndicator progress={45} label="Processing" />
                  <ProgressIndicator progress={100} label="Complete" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Form Elements & Validation
              </CardTitle>
              <CardDescription>
                Enhanced form components with built-in validation states and accessibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-6">
                <ValidatedInput
                  label="Full Name"
                  description="Enter your full legal name"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  success={formData.name.length > 2 ? "Name looks good!" : undefined}
                />

                <ValidatedInput
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  error={formData.email && !formData.email.includes('@') ? "Please enter a valid email" : undefined}
                />

                <ValidatedTextarea
                  label="Message"
                  placeholder="Your message here..."
                  maxLength={200}
                  showCharCount
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  info="This will be sent to our support team"
                />

                <Button variant="hero" fullWidth>
                  Submit Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Card Variants & Layouts
              </CardTitle>
              <CardDescription>
                Flexible card system with multiple variants and interactive states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="md">
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle size="sm">Elevated Card</CardTitle>
                    <CardDescription>Enhanced shadow and hover effects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Perfect for highlighting important content or creating visual hierarchy.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="interactive" onClick={() => alert('Interactive card clicked!')}>
                  <CardHeader>
                    <CardTitle size="sm">Interactive Card</CardTitle>
                    <CardDescription>Click me!</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Hover and click interactions built-in for better UX.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="outline" rounded="lg">
                  <CardHeader>
                    <CardTitle size="sm">Outline Card</CardTitle>
                    <CardDescription>Subtle border styling</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <StatusDot variant="success" />
                      <span className="text-sm">Status: Active</span>
                    </div>
                  </CardContent>
                </Card>
              </ResponsiveGrid>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Responsive Grid Systems
              </CardTitle>
              <CardDescription>
                Flexible grid layouts that adapt to different screen sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-semibold">Responsive Grid</h3>
                <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="sm">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-sm font-medium">Item {i + 1}</span>
                    </div>
                  ))}
                </ResponsiveGrid>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Auto Grid (Dynamic Columns)</h3>
                <AutoGrid minWidth="150px" gap="sm">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 bg-primary/10 rounded-md flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">Auto {i + 1}</span>
                    </div>
                  ))}
                </AutoGrid>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Loading & Empty States
              </CardTitle>
              <CardDescription>
                Consistent feedback for different application states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Loading States</h3>
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm">Small spinner</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <LoadingSpinner size="md" variant="primary" />
                      <span className="text-sm">Primary spinner</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Error State</h3>
                  <div className="border rounded-lg">
                    <ErrorState
                      title="Connection Failed"
                      message="Unable to connect to the server. Please check your internet connection."
                      action={{
                        label: "Retry",
                        onClick: () => alert("Retrying...")
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Empty State</h3>
                <div className="border rounded-lg">
                  <EmptyState
                    title="No items found"
                    message="Get started by creating your first item."
                    action={{
                      label: "Create Item",
                      onClick: () => alert("Creating item...")
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};