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
      blog_posts: {
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
          tags: string[] | null
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
          tags?: string[] | null
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
          tags?: string[] | null
          title?: string
          updated_at?: string | null
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
