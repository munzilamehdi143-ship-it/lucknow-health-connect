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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_number: string
          appointment_time: string
          availability_mode: Database["public"]["Enums"]["availability_mode"]
          consultation_fee: number
          created_at: string
          doctor_id: string | null
          doctor_name: string | null
          doctor_specialization: string | null
          hospital_id: string
          hospital_name: string
          id: string
          patient_age: number | null
          patient_email: string | null
          patient_gender: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string
          payment_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          platform_fee: number
          reason: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_number?: string
          appointment_time: string
          availability_mode?: Database["public"]["Enums"]["availability_mode"]
          consultation_fee?: number
          created_at?: string
          doctor_id?: string | null
          doctor_name?: string | null
          doctor_specialization?: string | null
          hospital_id: string
          hospital_name: string
          id?: string
          patient_age?: number | null
          patient_email?: string | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          platform_fee?: number
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_number?: string
          appointment_time?: string
          availability_mode?: Database["public"]["Enums"]["availability_mode"]
          consultation_fee?: number
          created_at?: string
          doctor_id?: string | null
          doctor_name?: string | null
          doctor_specialization?: string | null
          hospital_id?: string
          hospital_name?: string
          id?: string
          patient_age?: number | null
          patient_email?: string | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          platform_fee?: number
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          added_by: string | null
          availability_mode: Database["public"]["Enums"]["availability_mode"]
          consultation_fee: number | null
          created_at: string
          department: string | null
          fee_verified: boolean
          full_name: string
          hospital_id: string
          id: string
          languages: string[]
          last_verified_at: string | null
          opd_schedule: Json
          photo_url: string | null
          profile: string | null
          qualification: string | null
          registration_council: string | null
          registration_number: string | null
          specialization: string
          sub_specialization: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          years_experience: number | null
        }
        Insert: {
          added_by?: string | null
          availability_mode?: Database["public"]["Enums"]["availability_mode"]
          consultation_fee?: number | null
          created_at?: string
          department?: string | null
          fee_verified?: boolean
          full_name: string
          hospital_id: string
          id?: string
          languages?: string[]
          last_verified_at?: string | null
          opd_schedule?: Json
          photo_url?: string | null
          profile?: string | null
          qualification?: string | null
          registration_council?: string | null
          registration_number?: string | null
          specialization: string
          sub_specialization?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Update: {
          added_by?: string | null
          availability_mode?: Database["public"]["Enums"]["availability_mode"]
          consultation_fee?: number | null
          created_at?: string
          department?: string | null
          fee_verified?: boolean
          full_name?: string
          hospital_id?: string
          id?: string
          languages?: string[]
          last_verified_at?: string | null
          opd_schedule?: Json
          photo_url?: string | null
          profile?: string | null
          qualification?: string | null
          registration_council?: string | null
          registration_number?: string | null
          specialization?: string
          sub_specialization?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_registrations: {
        Row: {
          address: string
          appointment_system: string | null
          city: string
          contact_person: string
          created_at: string
          departments: string | null
          doctors_info: string | null
          hospital_name: string
          hospital_type: Database["public"]["Enums"]["hospital_type"] | null
          id: string
          official_email: string
          phone: string
          pincode: string | null
          registration_details: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"]
          website: string | null
        }
        Insert: {
          address: string
          appointment_system?: string | null
          city?: string
          contact_person: string
          created_at?: string
          departments?: string | null
          doctors_info?: string | null
          hospital_name: string
          hospital_type?: Database["public"]["Enums"]["hospital_type"] | null
          id?: string
          official_email: string
          phone: string
          pincode?: string | null
          registration_details?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Update: {
          address?: string
          appointment_system?: string | null
          city?: string
          contact_person?: string
          created_at?: string
          departments?: string | null
          doctors_info?: string | null
          hospital_name?: string
          hospital_type?: Database["public"]["Enums"]["hospital_type"] | null
          id?: string
          official_email?: string
          phone?: string
          pincode?: string | null
          registration_details?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string
          city: string
          created_at: string
          data_source: string | null
          departments: string[]
          emergency_available: boolean | null
          facilities: string[]
          google_maps_url: string | null
          id: string
          last_verified_at: string | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          name: string
          opd_timings: string | null
          phase: number
          phone: string | null
          photo_url: string | null
          pincode: string | null
          slug: string
          specializations: string[]
          state: string
          type: Database["public"]["Enums"]["hospital_type"]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          website: string | null
        }
        Insert: {
          address: string
          city?: string
          created_at?: string
          data_source?: string | null
          departments?: string[]
          emergency_available?: boolean | null
          facilities?: string[]
          google_maps_url?: string | null
          id?: string
          last_verified_at?: string | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          name: string
          opd_timings?: string | null
          phase?: number
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          slug: string
          specializations?: string[]
          state?: string
          type: Database["public"]["Enums"]["hospital_type"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          data_source?: string | null
          departments?: string[]
          emergency_available?: boolean | null
          facilities?: string[]
          google_maps_url?: string | null
          id?: string
          last_verified_at?: string | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          name?: string
          opd_timings?: string | null
          phase?: number
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          slug?: string
          specializations?: string[]
          state?: string
          type?: Database["public"]["Enums"]["hospital_type"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          hospital_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          hospital_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          hospital_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_appointment_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_hospital_admin: {
        Args: { _hospital_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "platform_admin" | "hospital_admin" | "patient"
      appointment_status:
        | "pending_confirmation"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "rescheduled"
      availability_mode:
        | "live"
        | "verified_schedule"
        | "confirmation_required"
        | "unavailable"
      hospital_type: "government" | "private"
      payment_status: "unpaid" | "paid" | "refunded" | "failed"
      verification_status: "pending" | "verified" | "suspended"
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
      app_role: ["platform_admin", "hospital_admin", "patient"],
      appointment_status: [
        "pending_confirmation",
        "confirmed",
        "cancelled",
        "completed",
        "rescheduled",
      ],
      availability_mode: [
        "live",
        "verified_schedule",
        "confirmation_required",
        "unavailable",
      ],
      hospital_type: ["government", "private"],
      payment_status: ["unpaid", "paid", "refunded", "failed"],
      verification_status: ["pending", "verified", "suspended"],
    },
  },
} as const
