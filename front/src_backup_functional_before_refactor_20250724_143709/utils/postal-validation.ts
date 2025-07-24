// File: src/utils/postal-validation.ts
// Helper functions and data for postal code validation

interface PostalCodeRules {
    startsWith: string[];
    format: RegExp;
    length: number;
  }
  
  interface CountryPostalRules {
    [key: string]: PostalCodeRules;
  }
  
  // Initial valid characters for postal codes by country
  export const COUNTRY_POSTAL_RULES: CountryPostalRules = {
    SK: {
      startsWith: ['0', '8', '9'],
      format: /^\d+$/,
      length: 5
    },
    CZ: {
      startsWith: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      format: /^\d+$/,
      length: 5
    },
    // Add more countries as needed
    DEFAULT: {
      startsWith: [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'
      ],
      format: /^[A-Z0-9]+$/i,
      length: 10
    }
  };
  
  // Check if the first character is valid for given country
  export const isValidFirstChar = (char: string, countryCode?: string): boolean => {
    const rules = COUNTRY_POSTAL_RULES[countryCode || 'DEFAULT'] || COUNTRY_POSTAL_RULES.DEFAULT;
    return rules.startsWith.includes(char.toUpperCase());
  };
  
  // Check if the postal code format is valid for given country
  export const isValidFormat = (postalCode: string, countryCode?: string): boolean => {
    const rules = COUNTRY_POSTAL_RULES[countryCode || 'DEFAULT'] || COUNTRY_POSTAL_RULES.DEFAULT;
    return (
      rules.format.test(postalCode) &&
      postalCode.length <= rules.length
    );
  };