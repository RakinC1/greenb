// Minimal database type definitions matching our Supabase schema
// In production: run `npx supabase gen types typescript` to auto-generate

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
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
        };
        Insert: {
          id: string;
          role: 'restaurant' | 'shelter';
          org_name: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: 'restaurant' | 'shelter';
          org_name?: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
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
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          category: string;
          quantity: number;
          unit: string;
          dietary_tags: string[];
          photo_url?: string | null;
          expires_at: string;
          status?: 'available' | 'claimed' | 'expired';
          lat?: number | null;
          lng?: number | null;
          co2_saved?: number;
          water_saved?: number;
          created_at?: string;
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
          created_at?: string;
        };
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
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

