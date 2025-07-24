// File: shared/types/shared.shared.shared.transport-forms.types.types.types.types.ts
// Last change: Adjusted Country interface to match BE response with optional fields


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
  name_en: string;
  name_local: string;
  name_sk: string;
  logistics_priority: number;
  code_3?: string;           // Optional, provided by BE
  numeric_code?: string;     // Optional, not provided by BE
  phone_code?: string;
  continent_id?: number;
  is_eu?: boolean;
  capital_en?: string;
  currency_code?: string;
  driving_side?: string;
  created_at?: Date;
  updated_at?: Date;
  is_schengen?: boolean;
  area_km2?: number;
  flag?: string;             // Optional, generated in FE
}

// Location data used in transport form
export interface Location {
  country: { cc: string; flag: string };
  psc: string;
  city: string;
  time: string;
  lat?: number;
  lng?: number;
}

// Other types remain unchanged...
export interface TransportFormData {
  pickup: Location;
  delivery: Location;
  cargo: {
    pallets: number;
    weight: number;
  };
}

export interface LocationSuggestion {
  cc: string;
  psc: string;
  city: string;
  country?: string;
  flag_url?: string;
  flag?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  logistics_priority?: number;
  priority?: number;
}

export enum LocationType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery'
}

export interface LocationApiResponse {
  results: LocationSuggestion[];
  hasMore: boolean;
  total: number;
}

export interface CountryApiResponse {
  results: Country[];
}

export const DEFAULT_TRANSPORT_FORM_DATA: TransportFormData = {
  pickup: { country: { cc: '', flag: '' }, psc: '', city: '', time: '', lat: 0, lng: 0 },
  delivery: { country: { cc: '', flag: '' }, psc: '', city: '', time: '', lat: 0, lng: 0 },
  cargo: { pallets: 0, weight: 0 },
};