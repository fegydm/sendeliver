// File: src/types/location.types.ts
// Last change: Unified field naming to use shorter versions (postal_code -> psc, country_code -> cc)

export interface Country {
  cc: string;                // Changed from code_2: ISO 3166-1 alpha-2 (e.g., 'SK')
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
  flag: string;              // Changed from flag_url
}

export interface Location {
  cc: string;
  psc: string;
  city: string;
  flag: string;
  lat: number;
  lng: number;
  time?: string;           // Optional for suggestions
  testTime?: Date | null; // Pridané voliteľné testTime pole
}

export interface LocationSuggestion extends Omit<Location, 'time'> {
  priority: number;        // For sorting results
}

export interface LocationFormData {
  pickup: Location;
  delivery: Location;
  cargo: {
    pallets: number;
    weight: number;
  };
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