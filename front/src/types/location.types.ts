// File: src/types/location.types.ts
// Last change: Unified field naming to use shorter versions (postal_code -> psc, country_code -> cc)

// ============================================================================
// Base Entity Types
// ============================================================================

export interface Country {
  id: number;
  name_en: string;
  name_sk: string;
  name_local: string;
  code_2: string;             // ISO 3166-1 alpha-2 country code (e.g., 'SK')
  code_3: string;             // ISO 3166-1 alpha-3 country code (e.g., 'SVK')
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
  flag_url?: string;
}

export interface City {
  name: string;
  psc: string;               // Updated from postal_code
  cc: string;                // Updated from country_code
}

// ============================================================================
// Form and Field Types
// ============================================================================

export interface LocationSuggestion {
  cc: string;                // Updated from country_code
  psc: string;              // Updated from postal_code
  city: string;             // Updated from place_name
  country: Country;
}

export interface EnhancedLocationSuggestion extends LocationSuggestion {
  matchType: 'psc' | 'city' | 'both';  // Updated from postal
  matchScore: number;
}

export interface FieldValue<T> {
  value: T;
  isValid: boolean;
  isDirty: boolean;
  error: string | null;
  lastModified?: number;
}

export interface LocationFormState {
  country: FieldValue<Country | null>;
  psc: FieldValue<string>;            // Updated from postalCode
  city: FieldValue<string>;
  isComplete: boolean;
  suggestions: LocationSuggestion[];
  validation?: {
    isPending: boolean;
    lastChecked?: number;
    errors: string[];
  };
}

// ============================================================================
// Suggestion and Search Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string | null;
  suggestions?: LocationSuggestion[];
  details?: Record<string, unknown>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface LocationApiResponse {
  results: LocationSuggestion[];
  total: number;
  hasMore: boolean;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    query?: string;
  };
}

export interface CountryApiResponse {
  countries: Country[];
  error?: string;
  meta?: {
    total: number;
    cached: boolean;
    timestamp: number;
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

export enum LocationType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery'
}

export interface LocationConfig {
  type: LocationType;
  required?: boolean;
  allowInternational?: boolean;
  restrictCountries?: string[];
  suggestionsLimit?: number;
  validation?: {
    minPscLength?: number;           // Updated from minPostalCodeLength
    minCityLength?: number;
    requireExactMatch?: boolean;
    customValidators?: {
      psc?: (code: string) => boolean | Promise<boolean>;  // Updated from postalCode
      city?: (name: string) => boolean | Promise<boolean>;
    };
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface LocationSelectProps {
  onSelect?: (location: LocationSuggestion) => void;
  onValidChange?: (isValid: boolean) => void;
  initialValue?: Partial<LocationFormState>;
  config?: LocationConfig;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean | Promise<boolean>;
  messages?: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
    custom?: string;
  };
}