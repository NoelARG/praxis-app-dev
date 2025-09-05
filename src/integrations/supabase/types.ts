export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      user_profiles: {
        Row: {
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          username: string | null
          timezone: string | null
          primary_goal: string | null
          manifesto: string | null
          ten_year_vision: string | null
          five_year_goal: string | null
          one_year_goal: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          username?: string | null
          timezone?: string | null
          primary_goal?: string | null
          manifesto?: string | null
          ten_year_vision?: string | null
          five_year_goal?: string | null
          one_year_goal?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>
      }
      user_activity: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_data: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_data?: Json | null
        }
        Update: Partial<Database["public"]["Tables"]["user_activity"]["Insert"]>
      }
      daily_plans: {
        Row: {
          id: string
          user_id: string
          plan_date: string
          morning_intention: string | null
          evening_reflection: string | null
          energy_level: number | null
          mood_rating: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_date: string
          morning_intention?: string | null
          evening_reflection?: string | null
          energy_level?: number | null
          mood_rating?: number | null
        }
        Update: Partial<Database["public"]["Tables"]["daily_plans"]["Insert"]>
      }
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          daily_plan_id: string | null
          title: string
          description: string | null
          completed: boolean
          task_order: number | null
          estimated_minutes: number | null
          actual_minutes: number | null
          priority: string | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          daily_plan_id?: string | null
          title: string
          description?: string | null
          completed?: boolean
          task_order?: number | null
          estimated_minutes?: number | null
          actual_minutes?: number | null
          priority?: string | null
          completed_at?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["daily_tasks"]["Insert"]>
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_date: string | null
          completed: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_date?: string | null
          completed?: boolean
        }
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>
      }
      heroes: {
        Row: {
          id: string
          name: string
          title: string | null
          era: string | null
          expertise: string[] | null
          description: string | null
          image_url: string | null
          color: string | null
          primary_color: string | null
          accent_color: string | null
          quote: string | null
          background: string | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          title?: string | null
          era?: string | null
          expertise?: string[] | null
          description?: string | null
          image_url?: string | null
          color?: string | null
          primary_color?: string | null
          accent_color?: string | null
          quote?: string | null
          background?: string | null
          is_active?: boolean | null
        }
        Update: Partial<Database["public"]["Tables"]["heroes"]["Insert"]>
      }
      system_prompts: {
        Row: {
          id: string
          name: string
          title: string
          system_prompt: string
          context_access: string[] | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          title: string
          system_prompt: string
          context_access?: string[] | null
          is_active?: boolean | null
        }
        Update: Partial<Database["public"]["Tables"]["system_prompts"]["Insert"]>
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          persona_name: string
          session_date: string
          messages: Json | null
          context_snapshot: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          persona_name: string
          session_date: string
          messages?: Json | null
          context_snapshot?: Json | null
        }
        Update: Partial<Database["public"]["Tables"]["chat_sessions"]["Insert"]>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
