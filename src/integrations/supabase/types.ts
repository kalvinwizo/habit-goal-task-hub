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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      custom_categories: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          auto_track: boolean
          category: string | null
          completed: boolean
          created_at: string
          current_progress: number
          id: string
          linked_habit_ids: string[] | null
          linked_task_ids: string[] | null
          milestones: Json | null
          reminder_times: string[] | null
          target_date: string
          target_value: number | null
          title: string
          tracking_type: string
          updated_at: string
          user_id: string
          why: string | null
        }
        Insert: {
          auto_track?: boolean
          category?: string | null
          completed?: boolean
          created_at?: string
          current_progress?: number
          id?: string
          linked_habit_ids?: string[] | null
          linked_task_ids?: string[] | null
          milestones?: Json | null
          reminder_times?: string[] | null
          target_date: string
          target_value?: number | null
          title: string
          tracking_type?: string
          updated_at?: string
          user_id: string
          why?: string | null
        }
        Update: {
          auto_track?: boolean
          category?: string | null
          completed?: boolean
          created_at?: string
          current_progress?: number
          id?: string
          linked_habit_ids?: string[] | null
          linked_task_ids?: string[] | null
          milestones?: Json | null
          reminder_times?: string[] | null
          target_date?: string
          target_value?: number | null
          title?: string
          tracking_type?: string
          updated_at?: string
          user_id?: string
          why?: string | null
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          checklist_progress: string[] | null
          created_at: string
          date: string
          habit_id: string
          id: string
          numeric_value: number | null
          state: string
          timer_value: number | null
          user_id: string
        }
        Insert: {
          checklist_progress?: string[] | null
          created_at?: string
          date: string
          habit_id: string
          id?: string
          numeric_value?: number | null
          state?: string
          timer_value?: number | null
          user_id: string
        }
        Update: {
          checklist_progress?: string[] | null
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          numeric_value?: number | null
          state?: string
          timer_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived: boolean
          best_streak: number
          category: string
          checklist_items: Json | null
          created_at: string
          current_streak: number
          difficulty: string
          evaluation_type: string
          frequency: string
          id: string
          linked_goal_id: string | null
          monthly_dates: number[] | null
          name: string
          notes: string | null
          reminder_times: string[] | null
          specific_days: number[] | null
          target_numeric_value: number | null
          target_timer_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          best_streak?: number
          category: string
          checklist_items?: Json | null
          created_at?: string
          current_streak?: number
          difficulty?: string
          evaluation_type?: string
          frequency?: string
          id?: string
          linked_goal_id?: string | null
          monthly_dates?: number[] | null
          name: string
          notes?: string | null
          reminder_times?: string[] | null
          specific_days?: number[] | null
          target_numeric_value?: number | null
          target_timer_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          best_streak?: number
          category?: string
          checklist_items?: Json | null
          created_at?: string
          current_streak?: number
          difficulty?: string
          evaluation_type?: string
          frequency?: string
          id?: string
          linked_goal_id?: string | null
          monthly_dates?: number[] | null
          name?: string
          notes?: string | null
          reminder_times?: string[] | null
          specific_days?: number[] | null
          target_numeric_value?: number | null
          target_timer_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          daily_summary: boolean
          default_reminder_time: string
          id: string
          notifications_enabled: boolean
          show_streaks: boolean
          start_of_day: string
          streak_reminders: boolean
          theme: string
          updated_at: string
          week_start_day: number
        }
        Insert: {
          created_at?: string
          daily_summary?: boolean
          default_reminder_time?: string
          id: string
          notifications_enabled?: boolean
          show_streaks?: boolean
          start_of_day?: string
          streak_reminders?: boolean
          theme?: string
          updated_at?: string
          week_start_day?: number
        }
        Update: {
          created_at?: string
          daily_summary?: boolean
          default_reminder_time?: string
          id?: string
          notifications_enabled?: boolean
          show_streaks?: boolean
          start_of_day?: string
          streak_reminders?: boolean
          theme?: string
          updated_at?: string
          week_start_day?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          completed: boolean
          completed_dates: string[] | null
          created_at: string
          dates: string[] | null
          id: string
          linked_goal_id: string | null
          monthly_dates: number[] | null
          numeric_value: number | null
          reminder_times: string[] | null
          target_numeric_value: number | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean
          completed_dates?: string[] | null
          created_at?: string
          dates?: string[] | null
          id?: string
          linked_goal_id?: string | null
          monthly_dates?: number[] | null
          numeric_value?: number | null
          reminder_times?: string[] | null
          target_numeric_value?: number | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean
          completed_dates?: string[] | null
          created_at?: string
          dates?: string[] | null
          id?: string
          linked_goal_id?: string | null
          monthly_dates?: number[] | null
          numeric_value?: number | null
          reminder_times?: string[] | null
          target_numeric_value?: number | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
