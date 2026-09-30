export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      allowance_cycles: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          period: string
          start_date: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          period: string
          start_date: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          period?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "allowance_cycles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          icon: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          icon: string
          id: string
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_layouts: {
        Row: {
          id: string
          is_visible: boolean | null
          order: number
          slot_size: string
          updated_at: string | null
          user_id: string
          widget_type: string
        }
        Insert: {
          id?: string
          is_visible?: boolean | null
          order?: number
          slot_size: string
          updated_at?: string | null
          user_id: string
          widget_type: string
        }
        Update: {
          id?: string
          is_visible?: boolean | null
          order?: number
          slot_size?: string
          updated_at?: string | null
          user_id?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_layouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category_id: string
          created_at: string | null
          cycle_id: string | null
          id: string
          is_impulse: boolean | null
          note: string | null
          spent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string | null
          cycle_id?: string | null
          id?: string
          is_impulse?: boolean | null
          note?: string | null
          spent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string | null
          cycle_id?: string | null
          id?: string
          is_impulse?: boolean | null
          note?: string | null
          spent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "allowance_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_streak: number | null
          bio: string | null
          campus: string | null
          created_at: string | null
          currency_code: string | null
          current_streak: number | null
          display_name: string | null
          id: string
          is_public: boolean | null
          last_logged_date: string | null
          theme_config: Json | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          best_streak?: number | null
          bio?: string | null
          campus?: string | null
          created_at?: string | null
          currency_code?: string | null
          current_streak?: number | null
          display_name?: string | null
          id: string
          is_public?: boolean | null
          last_logged_date?: string | null
          theme_config?: Json | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          best_streak?: number | null
          bio?: string | null
          campus?: string | null
          created_at?: string | null
          currency_code?: string | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          is_public?: boolean | null
          last_logged_date?: string | null
          theme_config?: Json | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          color: string | null
          created_at: string | null
          current_amount: number | null
          icon: string | null
          id: string
          is_public: boolean | null
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          target_amount: number
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
