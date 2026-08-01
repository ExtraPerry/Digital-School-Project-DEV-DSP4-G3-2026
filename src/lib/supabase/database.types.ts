export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      boat_availability_time_slots: {
        Row: {
          boat_id: string
          created_at: string
          end_date: string
          id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          boat_id: string
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          updated_at?: string
        }
        Update: {
          boat_id?: string
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boat_availability_time_slots_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
        ]
      }
      boat_documents: {
        Row: {
          boat_id: string | null
          created_at: string
          document_type: Database["public"]["Enums"]["boat_document_type"]
          id: string
          mime_type: string | null
          owner_id: string
          storage_bucket: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          boat_id?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["boat_document_type"]
          id?: string
          mime_type?: string | null
          owner_id: string
          storage_bucket?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          boat_id?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["boat_document_type"]
          id?: string
          mime_type?: string | null
          owner_id?: string
          storage_bucket?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boat_documents_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boat_documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      boat_equipment_links: {
        Row: {
          boat_id: string
          equipment: Database["public"]["Enums"]["boat_equipment"]
        }
        Insert: {
          boat_id: string
          equipment: Database["public"]["Enums"]["boat_equipment"]
        }
        Update: {
          boat_id?: string
          equipment?: Database["public"]["Enums"]["boat_equipment"]
        }
        Relationships: [
          {
            foreignKeyName: "boat_equipment_links_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
        ]
      }
      boat_media: {
        Row: {
          alt_text: string | null
          boat_id: string
          created_at: string
          id: string
          is_cover: boolean
          sort_order: number
          storage_bucket: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          boat_id: string
          created_at?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_bucket?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          boat_id?: string
          created_at?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_bucket?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boat_media_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
        ]
      }
      boat_reservations: {
        Row: {
          boat_id: string
          created_at: string
          currency: string
          end_date: string
          id: string
          renter_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          boat_id: string
          created_at?: string
          currency?: string
          end_date: string
          id?: string
          renter_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["reservation_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          boat_id?: string
          created_at?: string
          currency?: string
          end_date?: string
          id?: string
          renter_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boat_reservations_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boat_reservations_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      boat_reviews: {
        Row: {
          author_name: string
          boat_id: string
          comment: string
          created_at: string
          id: string
          rating: number
          reviewer_id: string | null
          updated_at: string
        }
        Insert: {
          author_name: string
          boat_id: string
          comment: string
          created_at?: string
          id?: string
          rating: number
          reviewer_id?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string
          boat_id?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boat_reviews_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boat_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      boats: {
        Row: {
          badge: string | null
          capacity: number
          created_at: string
          deposit_amount: number
          description: string | null
          draft_m: number
          id: string
          is_published: boolean
          length_m: number
          motorization: string | null
          name: string
          owner_id: string | null
          port_id: string
          price_per_day: number
          published_at: string | null
          rating: number
          skipper_option: Database["public"]["Enums"]["boat_skipper_option"]
          type: Database["public"]["Enums"]["boat_type"]
          updated_at: string
          width_m: number
        }
        Insert: {
          badge?: string | null
          capacity: number
          created_at?: string
          deposit_amount?: number
          description?: string | null
          draft_m?: number
          id?: string
          is_published?: boolean
          length_m: number
          motorization?: string | null
          name: string
          owner_id?: string | null
          port_id: string
          price_per_day: number
          published_at?: string | null
          rating?: number
          skipper_option?: Database["public"]["Enums"]["boat_skipper_option"]
          type: Database["public"]["Enums"]["boat_type"]
          updated_at?: string
          width_m?: number
        }
        Update: {
          badge?: string | null
          capacity?: number
          created_at?: string
          deposit_amount?: number
          description?: string | null
          draft_m?: number
          id?: string
          is_published?: boolean
          length_m?: number
          motorization?: string | null
          name?: string
          owner_id?: string | null
          port_id?: string
          price_per_day?: number
          published_at?: string | null
          rating?: number
          skipper_option?: Database["public"]["Enums"]["boat_skipper_option"]
          type?: Database["public"]["Enums"]["boat_type"]
          updated_at?: string
          width_m?: number
        }
        Relationships: [
          {
            foreignKeyName: "boats_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boats_port_id_fkey"
            columns: ["port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          external_id: string | null
          id: string
          provider: string
          reservation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          external_id?: string | null
          id?: string
          provider?: string
          reservation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          external_id?: string | null
          id?: string
          provider?: string
          reservation_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "boat_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      ports: {
        Row: {
          country: string
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          auth_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_roles_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_roles_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_roles_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          auth_id: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          auth_id?: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_boat_filter_bounds: {
        Args: { p_port_name: string }
        Returns: {
          max_length: number
          max_price: number
          min_length: number
          min_price: number
        }[]
      }
      search_available_boats: {
        Args: {
          p_boat_types?: Database["public"]["Enums"]["boat_type"][]
          p_equipment?: Database["public"]["Enums"]["boat_equipment"][]
          p_from_date: string
          p_max_length?: number
          p_max_price?: number
          p_min_length?: number
          p_min_price?: number
          p_page?: number
          p_page_size?: number
          p_port_name: string
          p_skipper_included?: boolean
          p_sort_by?: string
          p_to_date: string
        }
        Returns: {
          badge: string
          capacity: number
          id: string
          length_m: number
          motorization: string
          name: string
          port_name: string
          price_per_day: number
          rating: number
          skipper_option: Database["public"]["Enums"]["boat_skipper_option"]
          total_count: number
          type: Database["public"]["Enums"]["boat_type"]
        }[]
      }
      upgrade_current_user_to_owner: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_roles_type"]
      }
    }
    Enums: {
      boat_document_type:
        | "INSURANCE"
        | "REGISTRATION"
        | "LICENSE"
        | "OTHER"
        | "SAILOR_CV"
      boat_equipment: "GPS" | "SLEEPING_BERTHS" | "EQUIPPED_KITCHEN"
      boat_skipper_option: "INCLUDED" | "OPTIONAL" | "NONE"
      boat_type: "SAILBOAT" | "MOTORBOAT" | "CATAMARAN" | "YACHT"
      reservation_status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
      user_roles_type: "VISITOR" | "RENTER" | "OWNER" | "ADMINISTRATOR"
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
    Enums: {
      boat_document_type: [
        "INSURANCE",
        "REGISTRATION",
        "LICENSE",
        "OTHER",
        "SAILOR_CV",
      ],
      boat_equipment: ["GPS", "SLEEPING_BERTHS", "EQUIPPED_KITCHEN"],
      boat_skipper_option: ["INCLUDED", "OPTIONAL", "NONE"],
      boat_type: ["SAILBOAT", "MOTORBOAT", "CATAMARAN", "YACHT"],
      reservation_status: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      user_roles_type: ["VISITOR", "RENTER", "OWNER", "ADMINISTRATOR"],
    },
  },
} as const
