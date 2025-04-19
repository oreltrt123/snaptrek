export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      game_sessions: {
        Row: {
          id: string
          mode: string
          max_players: number
          current_players: number
          status: "waiting" | "in_progress" | "completed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mode: string
          max_players: number
          current_players?: number
          status?: "waiting" | "in_progress" | "completed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mode?: string
          max_players?: number
          current_players?: number
          status?: "waiting" | "in_progress" | "completed"
          created_at?: string
          updated_at?: string
        }
      }
      game_players: {
        Row: {
          id: string
          user_id: string
          game_id: string
          character_id: string
          position_x: number
          position_y: number
          position_z: number
          is_moving: boolean
          is_sprinting?: boolean
          is_jumping?: boolean
          direction_x?: number
          direction_y?: number
          direction_z?: number
          health: number
          team?: string
          inventory: Json
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          character_id: string
          position_x?: number
          position_y?: number
          position_z?: number
          is_moving?: boolean
          is_sprinting?: boolean
          is_jumping?: boolean
          direction_x?: number
          direction_y?: number
          direction_z?: number
          health?: number
          team?: string
          inventory?: Json
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          character_id?: string
          position_x?: number
          position_y?: number
          position_z?: number
          is_moving?: boolean
          is_sprinting?: boolean
          is_jumping?: boolean
          direction_x?: number
          direction_y?: number
          direction_z?: number
          health?: number
          team?: string
          inventory?: Json
          joined_at?: string
        }
      }
      game_items: {
        Row: {
          id: string
          game_id: string
          type: string
          item_type: "weapon" | "item"
          position_x: number
          position_y: number
          position_z: number
          is_picked_up: boolean
          picked_up_by?: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          type: string
          item_type: "weapon" | "item"
          position_x: number
          position_y: number
          position_z: number
          is_picked_up?: boolean
          picked_up_by?: string
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          type?: string
          item_type?: "weapon" | "item"
          position_x?: number
          position_y?: number
          position_z?: number
          is_picked_up?: boolean
          picked_up_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
