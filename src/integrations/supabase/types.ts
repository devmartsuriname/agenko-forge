export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          blog_post_id: string
          category_id: string
          created_at: string
          id: string
        }
        Insert: {
          blog_post_id: string
          category_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blog_post_id?: string
          category_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_blog_post_categories_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_blog_post_categories_post_id"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          body: Json | null
          created_at: string | null
          excerpt: string | null
          feature_image_url: string | null
          id: string
          published_at: string | null
          seo_canonical_url: string | null
          seo_description: string | null
          seo_og_image: string | null
          seo_robots: string | null
          seo_schema_type: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: Json | null
          created_at?: string | null
          excerpt?: string | null
          feature_image_url?: string | null
          id?: string
          published_at?: string | null
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_robots?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: Json | null
          created_at?: string | null
          excerpt?: string | null
          feature_image_url?: string | null
          id?: string
          published_at?: string | null
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_robots?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          body: string | null
          client: string | null
          created_at: string
          created_by: string | null
          gallery: string[] | null
          hero_image: string | null
          id: string
          industry: string | null
          metrics: Json | null
          published_at: string | null
          services: string[] | null
          slug: string
          status: string
          summary: string | null
          tech_stack: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          client?: string | null
          created_at?: string
          created_by?: string | null
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          industry?: string | null
          metrics?: Json | null
          published_at?: string | null
          services?: string[] | null
          slug: string
          status?: string
          summary?: string | null
          tech_stack?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          client?: string | null
          created_at?: string
          created_by?: string | null
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          industry?: string | null
          metrics?: Json | null
          published_at?: string | null
          services?: string[] | null
          slug?: string
          status?: string
          summary?: string | null
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip: string | null
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip?: string | null
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip?: string | null
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      cta_interactions: {
        Row: {
          action: string
          created_at: string
          cta_type: string
          element_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          page_url: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          cta_type: string
          element_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_url: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          cta_type?: string
          element_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          page_url?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          name: string | null
          preferences: Json | null
          source: string | null
          status: string
          unsubscribed_at: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          name?: string | null
          preferences?: Json | null
          source?: string | null
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          name?: string | null
          preferences?: Json | null
          source?: string | null
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number | null
          status: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_url: string | null
          benefits: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          location: string | null
          published_at: string | null
          requirements: string[] | null
          responsibilities: string[] | null
          slug: string
          status: string
          team: string | null
          title: string
          type: string | null
          updated_at: string
          work_mode: string | null
        }
        Insert: {
          apply_url?: string | null
          benefits?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          published_at?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          slug: string
          status?: string
          team?: string | null
          title: string
          type?: string | null
          updated_at?: string
          work_mode?: string | null
        }
        Update: {
          apply_url?: string | null
          benefits?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          published_at?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          slug?: string
          status?: string
          team?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          work_mode?: string | null
        }
        Relationships: []
      }
      lab_projects: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          demo_url: string | null
          hero_image: string | null
          id: string
          published_at: string | null
          repo_url: string | null
          slug: string
          status: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          demo_url?: string | null
          hero_image?: string | null
          id?: string
          published_at?: string | null
          repo_url?: string | null
          slug: string
          status?: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          demo_url?: string | null
          hero_image?: string | null
          id?: string
          published_at?: string | null
          repo_url?: string | null
          slug?: string
          status?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      logs_app_events: {
        Row: {
          area: string
          id: string
          level: string
          message: string
          meta: Json | null
          route: string | null
          ts: string
          user_id: string | null
        }
        Insert: {
          area: string
          id?: string
          level: string
          message: string
          meta?: Json | null
          route?: string | null
          ts?: string
          user_id?: string | null
        }
        Update: {
          area?: string
          id?: string
          level?: string
          message?: string
          meta?: Json | null
          route?: string | null
          ts?: string
          user_id?: string | null
        }
        Relationships: []
      }
      logs_errors: {
        Row: {
          area: string
          error_code: string | null
          id: string
          message: string
          meta: Json | null
          route: string | null
          stack: string | null
          ts: string
          user_id: string | null
        }
        Insert: {
          area: string
          error_code?: string | null
          id?: string
          message: string
          meta?: Json | null
          route?: string | null
          stack?: string | null
          ts?: string
          user_id?: string | null
        }
        Update: {
          area?: string
          error_code?: string | null
          id?: string
          message?: string
          meta?: Json | null
          route?: string | null
          stack?: string | null
          ts?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          email: string
          id: string
          metadata: Json | null
          provider: string
          provider_order_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          email: string
          id?: string
          metadata?: Json | null
          provider: string
          provider_order_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string
          id?: string
          metadata?: Json | null
          provider?: string
          provider_order_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          body: Json | null
          created_at: string | null
          id: string
          published_at: string | null
          seo_canonical_url: string | null
          seo_description: string | null
          seo_og_image: string | null
          seo_robots: string | null
          seo_schema_type: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: Json | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_robots?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: Json | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_robots?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string
          provider: string
          provider_data: Json | null
          provider_payment_id: string | null
          status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          provider: string
          provider_data?: Json | null
          provider_payment_id?: string | null
          status: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          provider?: string
          provider_data?: Json | null
          provider_payment_id?: string | null
          status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_images: {
        Row: {
          alt: string | null
          created_at: string | null
          id: string
          project_id: string | null
          sort_order: number | null
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          sort_order?: number | null
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          body: Json | null
          created_at: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          seo_canonical_url: string | null
          seo_description: string | null
          seo_og_image: string | null
          seo_robots: string | null
          seo_schema_type: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: Json | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_robots?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: Json | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_robots?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      proposal_attachments: {
        Row: {
          created_at: string
          filename: string
          id: string
          mime_type: string
          proposal_id: string | null
          size_bytes: number
          storage_key: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          mime_type: string
          proposal_id?: string | null
          size_bytes: number
          storage_key: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          mime_type?: string
          proposal_id?: string | null
          size_bytes?: number
          storage_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_attachments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          proposal_id: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          proposal_id: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          proposal_id?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_events_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_recipients: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          proposal_id: string
          role: string | null
          token: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          proposal_id: string
          role?: string | null
          token: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          proposal_id?: string
          role?: string | null
          token?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_recipients_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          service_type: string | null
          status: string | null
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          service_type?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          service_type?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          accepted_at: string | null
          client_id: string | null
          content: string
          created_at: string
          created_by: string | null
          currency: string | null
          expires_at: string | null
          id: string
          public_id: string | null
          quote_id: string | null
          rejected_at: string | null
          rejection_reason: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          title: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          client_id?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          public_id?: string | null
          quote_id?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          client_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          public_id?: string | null
          quote_id?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "proposal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_activities: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          quote_id: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          quote_id: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          quote_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_activities_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          additional_requirements: string | null
          admin_notes: string | null
          assigned_to: string | null
          budget_range: string
          company: string | null
          created_at: string
          email: string
          estimated_cost: number | null
          id: string
          ip_address: string | null
          name: string
          phone: string | null
          priority: string
          project_scope: string
          quote_expires_at: string | null
          quoted_at: string | null
          referrer: string | null
          service_type: string
          status: string
          timeline: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          additional_requirements?: string | null
          admin_notes?: string | null
          assigned_to?: string | null
          budget_range: string
          company?: string | null
          created_at?: string
          email: string
          estimated_cost?: number | null
          id?: string
          ip_address?: string | null
          name: string
          phone?: string | null
          priority?: string
          project_scope: string
          quote_expires_at?: string | null
          quoted_at?: string | null
          referrer?: string | null
          service_type: string
          status?: string
          timeline: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          additional_requirements?: string | null
          admin_notes?: string | null
          assigned_to?: string | null
          budget_range?: string
          company?: string | null
          created_at?: string
          email?: string
          estimated_cost?: number | null
          id?: string
          ip_address?: string | null
          name?: string
          phone?: string | null
          priority?: string
          project_scope?: string
          quote_expires_at?: string | null
          quoted_at?: string | null
          referrer?: string | null
          service_type?: string
          status?: string
          timeline?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          content: Json | null
          created_at: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          seo_canonical_url: string | null
          seo_description: string | null
          seo_og_image: string | null
          seo_robots: string | null
          seo_schema_type: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_robots?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_canonical_url?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_robots?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_promote_admin: {
        Args: { p_code: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_proposal_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_proposal_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_blog_post_categories: {
        Args: { post_id: string }
        Returns: {
          color: string
          description: string
          id: string
          name: string
          slug: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_homepage_previews: {
        Args: {
          p_blog_limit?: number
          p_project_limit?: number
          p_service_limit?: number
        }
        Returns: Json
      }
      health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_registration_enabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_app_event: {
        Args: {
          p_area: string
          p_level: string
          p_message: string
          p_meta?: Json
          p_route?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      log_error: {
        Args: {
          p_area: string
          p_error_code?: string
          p_message: string
          p_meta?: Json
          p_route?: string
          p_stack?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      redact_pii: {
        Args: { input_text: string }
        Returns: string
      }
      set_bootstrap_hash: {
        Args: { p_code: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
