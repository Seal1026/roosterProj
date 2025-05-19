export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string
          email: string
          prompt: string
          frequency: string
          start_time: string
          end_time: string
          slider_value: number
          created_at: string
          last_processed: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          prompt: string
          frequency: string
          start_time: string
          end_time: string
          slider_value: number
          created_at?: string
          last_processed?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          prompt?: string
          frequency?: string
          start_time?: string
          end_time?: string
          slider_value?: number
          created_at?: string
          last_processed?: string | null
          is_active?: boolean
        }
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
  }
}