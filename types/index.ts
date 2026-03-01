// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'restaurant' | 'shelter';

export interface Profile {
  id: string;
  role: UserRole;
  org_name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

// ─── Listings ────────────────────────────────────────────────────────────────

export type ListingStatus = 'available' | 'claimed' | 'expired';

export type FoodCategory =
  | 'Produce'
  | 'Meat'
  | 'Dairy'
  | 'Bakery'
  | 'Cooked Meals'
  | 'Beverages'
  | 'Other';

export type FoodUnit = 'kg' | 'lbs' | 'portions' | 'liters' | 'pieces' | 'loaves';

export interface Listing {
  id: string;
  restaurant_id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  dietary_tags: string[];
  photo_url: string | null;
  expires_at: string;
  status: ListingStatus;
  lat: number | null;
  lng: number | null;
  co2_saved: number;
  water_saved: number;
  created_at: string;
  // joined
  profiles?: Pick<Profile, 'org_name' | 'lat' | 'lng' | 'address'>;
}

export interface ListingWithProfile extends Listing {
  profiles: Pick<Profile, 'org_name' | 'lat' | 'lng' | 'address'>;
}

// ─── Claims ──────────────────────────────────────────────────────────────────

export interface Claim {
  id: string;
  listing_id: string;
  shelter_id: string;
  claimed_at: string;
  pickup_confirmed: boolean;
  notes: string | null;
  // joined
  listings?: Listing;
  profiles?: Pick<Profile, 'org_name'>;
}

// ─── AI Predictions ──────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Prediction {
  id: string;
  restaurant_id: string;
  predicted_category: string;
  predicted_qty: number;
  risk_level: RiskLevel;
  confidence: number;
  for_date: string;
  created_at: string;
}

export interface GeminiPredictionItem {
  category: string;
  item_name: string;
  estimated_qty: number;
  unit: string;
  risk_level: RiskLevel;
  confidence: number;
  reason: string;
}

export interface GeminiPredictionResult {
  predictions: GeminiPredictionItem[];
  summary: string;
}

export interface PhotoAnalysisResult {
  name: string;
  category: FoodCategory;
  estimated_quantity: string;
  dietary_tags: string[];
}

// ─── Impact ──────────────────────────────────────────────────────────────────

export interface ImpactMetrics {
  co2: number;    // kg CO2 saved
  water: number;  // liters water saved
  meals: number;  // meal equivalents
}

export interface PlatformStats {
  total_meals: number;
  total_co2: number;
  total_water: number;
  total_rescues: number;
  active_restaurants: number;
  active_shelters: number;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Form Types ──────────────────────────────────────────────────────────────

export interface UploadFormData {
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  dietary_tags: string[];
  expires_at: string;
  notes: string;
  photo?: File;
}

export interface RegisterFormData {
  email: string;
  password: string;
  org_name: string;
  role: UserRole;
  address: string;
}
