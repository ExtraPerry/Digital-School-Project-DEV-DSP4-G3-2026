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
      admin_audit_log: {
        Row: {
          action: Database["public"]["Enums"]["admin_action_type"]
          actor_email_snapshot: string | null
          actor_user_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string
          target_table: string
          updated_at: string
        }
        Insert: {
          action: Database["public"]["Enums"]["admin_action_type"]
          actor_email_snapshot?: string | null
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id: string
          target_table: string
          updated_at?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["admin_action_type"]
          actor_email_snapshot?: string | null
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string
          target_table?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
          focal_point: string | null
          id: string
          is_cover: boolean
          kind: Database["public"]["Enums"]["boat_media_kind"]
          sort_order: number
          storage_bucket: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          boat_id: string
          created_at?: string
          focal_point?: string | null
          id?: string
          is_cover?: boolean
          kind?: Database["public"]["Enums"]["boat_media_kind"]
          sort_order?: number
          storage_bucket?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          boat_id?: string
          created_at?: string
          focal_point?: string | null
          id?: string
          is_cover?: boolean
          kind?: Database["public"]["Enums"]["boat_media_kind"]
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
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: Database["public"]["Enums"]["review_moderation_status"]
          rating: number
          reservation_id: string | null
          reviewer_id: string | null
          updated_at: string
        }
        Insert: {
          author_name: string
          boat_id: string
          comment: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: Database["public"]["Enums"]["review_moderation_status"]
          rating: number
          reservation_id?: string | null
          reviewer_id?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string
          boat_id?: string
          comment?: string
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: Database["public"]["Enums"]["review_moderation_status"]
          rating?: number
          reservation_id?: string | null
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
            foreignKeyName: "boat_reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boat_reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "boat_reservations"
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
          commission_amount: number | null
          created_at: string
          external_id: string | null
          id: string
          owner_amount: number | null
          provider: string
          reservation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          commission_amount?: number | null
          created_at?: string
          external_id?: string | null
          id?: string
          owner_amount?: number | null
          provider?: string
          reservation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          commission_amount?: number | null
          created_at?: string
          external_id?: string | null
          id?: string
          owner_amount?: number | null
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
      reservation_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          reservation_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reservation_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reservation_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_messages_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "boat_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          account_status: Database["public"]["Enums"]["user_account_status"]
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
          account_status?: Database["public"]["Enums"]["user_account_status"]
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
          account_status?: Database["public"]["Enums"]["user_account_status"]
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
      admin_global_search: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          entity_id: string
          entity_type: string
          subtitle: string
          title: string
        }[]
      }
      admin_moderate_review: {
        Args: {
          p_review_id: string
          p_status: Database["public"]["Enums"]["review_moderation_status"]
        }
        Returns: {
          author_name: string
          boat_id: string
          comment: string
          created_at: string
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: Database["public"]["Enums"]["review_moderation_status"]
          rating: number
          reservation_id: string | null
          reviewer_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "boat_reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_platform_stats: {
        Args: never
        Returns: {
          commission_this_month: number
          published_boats: number
          reservations_this_month: number
          total_users: number
        }[]
      }
      admin_set_boat_published: {
        Args: { p_boat_id: string; p_is_published: boolean }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "boats"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_roles_type"]
          p_user_id: string
        }
        Returns: {
          auth_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_roles_type"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_user_status: {
        Args: {
          p_status: Database["public"]["Enums"]["user_account_status"]
          p_user_id: string
        }
        Returns: {
          account_status: Database["public"]["Enums"]["user_account_status"]
          auth_id: string
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
          cover_alt_text: string
          cover_focal_point: string
          cover_storage_bucket: string
          cover_storage_path: string
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
      upgrade_current_user_to_owner: {
        Args: never
        Returns: Database["public"]["Enums"]["user_roles_type"]
      }
    }
    Enums: {
      admin_action_type:
        | "SET_USER_ROLE"
        | "SET_USER_STATUS"
        | "MODERATE_REVIEW"
        | "PUBLISH_BOAT"
        | "UNPUBLISH_BOAT"
      boat_document_type:
        | "INSURANCE"
        | "REGISTRATION"
        | "LICENSE"
        | "OTHER"
        | "SAILOR_CV"
      boat_equipment: "GPS" | "SLEEPING_BERTHS" | "EQUIPPED_KITCHEN"
      boat_media_kind: "COVER" | "COCKPIT" | "INTERIOR" | "ONBOARD" | "EXTERIOR"
      boat_skipper_option: "INCLUDED" | "OPTIONAL" | "NONE"
      boat_type: "SAILBOAT" | "MOTORBOAT" | "CATAMARAN" | "YACHT"
      reservation_status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
      review_moderation_status: "APPROVED" | "FLAGGED" | "REJECTED"
      user_account_status: "ACTIVE" | "PENDING" | "SUSPENDED"
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
      admin_action_type: [
        "SET_USER_ROLE",
        "SET_USER_STATUS",
        "MODERATE_REVIEW",
        "PUBLISH_BOAT",
        "UNPUBLISH_BOAT",
      ],
      boat_document_type: [
        "INSURANCE",
        "REGISTRATION",
        "LICENSE",
        "OTHER",
        "SAILOR_CV",
      ],
      boat_equipment: ["GPS", "SLEEPING_BERTHS", "EQUIPPED_KITCHEN"],
      boat_media_kind: ["COVER", "COCKPIT", "INTERIOR", "ONBOARD", "EXTERIOR"],
      boat_skipper_option: ["INCLUDED", "OPTIONAL", "NONE"],
      boat_type: ["SAILBOAT", "MOTORBOAT", "CATAMARAN", "YACHT"],
      reservation_status: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      review_moderation_status: ["APPROVED", "FLAGGED", "REJECTED"],
      user_account_status: ["ACTIVE", "PENDING", "SUSPENDED"],
      user_roles_type: ["VISITOR", "RENTER", "OWNER", "ADMINISTRATOR"],
    },
  },
} as const

