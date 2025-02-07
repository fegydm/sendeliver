// File: src/types/location.types.ts
// Last change: Updated Country interface to match database structure and added logistics priority

// ============================================================================
// Base Entity Types
// ============================================================================

export interface Country {
  id: number;                  // Primary key
  name_en: string;            // English name (e.g., 'Slovakia')
  name_sk: string;            // Slovak name (e.g., 'Slovensko')
  name_local: string;         // Name in local language
  code_2: string;             // ISO 3166-1 alpha-2 country code (e.g., 'SK')
  code_3: string;             // ISO 3166-1 alpha-3 country code (e.g., 'SVK')
  numeric_code: string;       // ISO 3166-1 numeric code
  phone_code: string;         // International calling code
  continent_id: number;       // Reference to continents table
  is_eu: boolean;            // European Union membership
  capital_en: string;        // Capital city name in English
  currency_code: string;     // ISO 4217 currency code
  driving_side: string;      // 'left' or 'right'
  created_at: Date;          // Record creation timestamp
  updated_at: Date;          // Record update timestamp
  is_schengen: boolean;      // Schengen Area membership
  area_km2: number;          // Country area in square kilometers
  logistics_priority: number; // Priority for logistics operations (0-100)
  flag_url?: string;         // Optional URL to country flag image
}

export interface City {
  name: string;              // City name
  postal_code: string;       // Postal/ZIP code in country format
  country_code: string;      // Reference to Country.code_2
}

// ============================================================================
// Form and Field Types
// ============================================================================

export interface FieldValue<T> {
  value: T;                  // Current field value
  isValid: boolean;          // Validation status
  isDirty: boolean;          // Whether field was modified
  error: string | null;      // Validation error message
  lastModified?: number;     // Timestamp of last change
}

export interface LocationFormState {
  country: FieldValue<Country | null>;    // Selected country with validation
  postalCode: FieldValue<string>;         // Postal code with validation
  city: FieldValue<string>;               // City with validation
  isComplete: boolean;                    // All required fields valid
  suggestions: LocationSuggestion[];      // Current location suggestions
  validation?: {
    isPending: boolean;                   // Validation in progress
    lastChecked?: number;                 // Last validation timestamp
    errors: string[];                     // Form-level errors
  };
}

// ============================================================================
// Suggestion and Search Types
// ============================================================================

export interface LocationSuggestion {
  country_code: string;      // ISO country code
  postal_code: string;       // Postal/ZIP code
  place_name: string;        // City name (API returns 'place_name' instead of 'city')
  city: string;             // City name
  country: Country;         // Full country object with all properties
}

export interface ValidationResult {
  isValid: boolean;                    // Validation status
  error?: string | null;               // Error message if invalid
  suggestions?: LocationSuggestion[];  // Available alternatives
  details?: Record<string, unknown>;   // Additional validation info
}

// ============================================================================
// API Response Types
// ============================================================================

export interface LocationApiResponse {
  results: LocationSuggestion[]; // Search results
  total: number;                 // Total available results
  hasMore: boolean;              // Whether more results are available
  error?: string;                // Error message if any
  meta?: {
    page?: number;               // Current page number
    limit?: number;              // Results per page
    query?: string;              // Search query used
  };
}

export interface CountryApiResponse {
  countries: Country[];          // List of countries
  error?: string;                // Error message if any
  meta?: {
    total: number;               // Total countries count
    cached: boolean;             // Whether response was cached
    timestamp: number;           // Response timestamp
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

export enum LocationType {
  PICKUP = 'pickup',            // Origin location
  DELIVERY = 'delivery'         // Destination location
}

export interface LocationConfig {
  type: LocationType;                   // Location type (pickup/delivery)
  required?: boolean;                   // Whether location is required
  allowInternational?: boolean;         // Allow international locations
  restrictCountries?: string[];         // List of allowed country codes
  suggestionsLimit?: number;            // Max suggestions to show
  validation?: {
    minPostalCodeLength?: number;       // Min postal code length
    minCityLength?: number;             // Min city name length
    requireExactMatch?: boolean;        // Require exact matches
    customValidators?: {
      postalCode?: (code: string) => boolean | Promise<boolean>;
      city?: (name: string) => boolean | Promise<boolean>;
    };
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface LocationSelectProps {
  onSelect?: (location: LocationSuggestion) => void; // Selection handler
  onValidChange?: (isValid: boolean) => void;        // Validation change handler
  initialValue?: Partial<LocationFormState>;         // Initial form state
  config?: LocationConfig;                           // Component configuration
}

export interface ValidationRules {
  required?: boolean;                                // Field is required
  minLength?: number;                               // Minimum value length
  maxLength?: number;                               // Maximum value length
  pattern?: RegExp;                                 // RegExp pattern to match
  validate?: (value: any) => boolean | Promise<boolean>; // Custom validator
  messages?: {
    required?: string;                              // Required field message
    minLength?: string;                             // Min length error message
    maxLength?: string;                             // Max length error message
    pattern?: string;                               // Pattern mismatch message
    custom?: string;                                // Custom validation message
  };
}