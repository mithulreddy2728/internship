export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          name: string
          email: string
          password: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          password: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          password?: string
          created_at?: string
        }
      }
      cameras: {
        Row: {
          id: number
          type: number
          source: string
          status: string
          created_at: string
        }
        Insert: {
          id?: number
          type: number
          source: string
          status: string
          created_at?: string
        }
        Update: {
          id?: number
          type?: number
          source?: string
          status?: string
          created_at?: string
        }
      }
      geo_markers: {
        Row: {
          id: number
          camera_id: number
          x1: number
          x2: number
          y1: number
          y2: number
          created_at: string
        }
        Insert: {
          id?: number
          camera_id: number
          x1: number
          x2: number
          y1: number
          y2: number
          created_at?: string
        }
        Update: {
          id?: number
          camera_id?: number
          x1?: number
          x2?: number
          y1?: number
          y2?: number
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: number
          camera_id: number
          marker_id: number
          number: string
          numberplate_image: string | null
          vehicle_image: string | null
          person_image: string | null
          time_stamp: string
          status: number
          created_at: string
        }
        Insert: {
          id?: number
          camera_id: number
          marker_id: number
          number: string
          numberplate_image?: string | null
          vehicle_image?: string | null
          person_image?: string | null
          time_stamp?: string
          status: number
          created_at?: string
        }
        Update: {
          id?: number
          camera_id?: number
          marker_id?: number
          number?: string
          numberplate_image?: string | null
          vehicle_image?: string | null
          person_image?: string | null
          time_stamp?: string
          status?: number
          created_at?: string
        }
      }
    }
  }
}
