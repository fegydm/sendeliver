// File: src/types/transport-forms.types.ts
// Last change: Updated LocationSuggestion to support both front-end and API formats

// Request sent to AI API
export interface AIRequest {
  message: string;
  type: "sender" | "hauler";
  lang1?: string;
}

// Response received from AI API
export interface AIResponse {
  content?: string;
  data?: {
    pickupLocation?: string;
    deliveryLocation?: string;
    pickupTime?: string;
    deliveryTime?: string;
    weight?: string;
    palletCount?: number;
    coordinates?: {
      pickup?: { lat: number; lng: number };
      delivery?: { lat: number; lng: number };
    };
  };
}

// Country data
export interface Country {
  cc: string;                // ISO 3166-1 alpha-2 (e.g., 'SK')
  code_3: string;            // ISO 3166-1 alpha-3 (e.g., 'SVK')
  name_en: string;
  name_sk: string;
  name_local: string;
  numeric_code: string;
  phone_code: string;
  continent_id: number;
  is_eu: boolean;
  capital_en: string;
  currency_code: string;
  driving_side: string;
  created_at: Date;
  updated_at: Date;
  is_schengen: boolean;
  area_km2: number;
  logistics_priority: number;
  flag: string;
}

// Location data used in transport form
export interface Location {
  country: { cc: string; flag: string }; // Simplified from full Country type
  psc: string;
  city: string;
  time: string;
  lat?: number;             // Optional GPS coordinates from AI
  lng?: number;
}

// Unified form data for both AI and manual forms
export interface TransportFormData {
  pickup: Location;
  delivery: Location;
  cargo: {
    pallets: number;
    weight: number;
  };
}

// Suggestion for location autocomplete
export interface LocationSuggestion {
  cc: string;
  psc: string;
  city: string;
  country?: string;        // API response includes this
  flag_url?: string;       // API response format
  flag?: string;           // Front-end format
  lat?: number;            // Frontend format
  lng?: number;            // Frontend format
  latitude?: number;       // API response format
  longitude?: number;      // API response format
  logistics_priority?: number; // API response format
  priority?: number;       // For sorting results
}

export enum LocationType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery'
}

// API Response types
export interface LocationApiResponse {
  results: LocationSuggestion[];
  hasMore: boolean;
  total: number;
}

export interface CountryApiResponse {
  results: Country[];
}

export interface PostalFormat {
  format: string;
  regex: string;
}

export const DEFAULT_TRANSPORT_FORM_DATA: TransportFormData = {
  pickup: { country: { cc: '', flag: '' }, psc: '', city: '', time: '', lat: 0, lng: 0 },
  delivery: { country: { cc: '', flag: '' }, psc: '', city: '', time: '', lat: 0, lng: 0 },
  cargo: { pallets: 0, weight: 0 },
};