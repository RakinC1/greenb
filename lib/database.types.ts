// Generated-style Supabase types matching supabase/schema.sql.
// Keep this aligned with schema changes to preserve strong typing.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'restaurant' | 'shelter';
          org_name: string;
          address: string | null;
          lat: number | null;
          lng: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'restaurant' | 'shelter';
          org_name: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'restaurant' | 'shelter';
          org_name?: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          category: string;
          quantity: number;
          unit: string;
          dietary_tags: string[];
          photo_url: string | null;
          expires_at: string;
          status: 'available' | 'claimed' | 'expired';
          lat: number | null;
          lng: number | null;
          co2_saved: number;
          water_saved: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          category: string;
          quantity: number;
          unit: string;
          dietary_tags?: string[];
          photo_url?: string | null;
          expires_at: string;
          status?: 'available' | 'claimed' | 'expired';
          lat?: number | null;
          lng?: number | null;
          co2_saved?: number;
          water_saved?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          category?: string;
          quantity?: number;
          unit?: string;
          dietary_tags?: string[];
          photo_url?: string | null;
          expires_at?: string;
          status?: 'available' | 'claimed' | 'expired';
          lat?: number | null;
          lng?: number | null;
          co2_saved?: number;
          water_saved?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listings_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      claims: {
        Row: {
          id: string;
          listing_id: string;
          shelter_id: string;
          claimed_at: string;
          pickup_confirmed: boolean;
          notes: string | null;
        };
        Insert: {
          id?: string;
          listing_id: string;
          shelter_id: string;
          claimed_at?: string;
          pickup_confirmed?: boolean;
          notes?: string | null;
        };
        Update: {
          id?: string;
          listing_id?: string;
          shelter_id?: string;
          claimed_at?: string;
          pickup_confirmed?: boolean;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'claims_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'claims_shelter_id_fkey';
            columns: ['shelter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      predictions: {
        Row: {
          id: string;
          restaurant_id: string;
          predicted_category: string;
          predicted_qty: number;
          risk_level: 'low' | 'medium' | 'high';
          confidence: number;
          for_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          predicted_category: string;
          predicted_qty: number;
          risk_level?: 'low' | 'medium' | 'high';
          confidence: number;
          for_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          predicted_category?: string;
          predicted_qty?: number;
          risk_level?: 'low' | 'medium' | 'high';
          confidence?: number;
          for_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'predictions_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      platform_stats: {
        Row: {
          total_rescues: number | null;
          total_co2_saved: number | null;
          total_water_saved: number | null;
          total_quantity: number | null;
          active_restaurants: number | null;
          active_shelters: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      update_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

