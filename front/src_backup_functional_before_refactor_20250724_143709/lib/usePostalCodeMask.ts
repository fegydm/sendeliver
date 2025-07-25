// File: src/hooks/usePostalCodeMask.ts
// Hook for dynamically selecting postal code mask based on country

import { useMemo } from "react";

// Define default masks for countries 
const countryMasks: Record<string, string> = {
  CZ: "999 99",  // for Czech Republic: 3 digits, space, 2 digits
  DE: "99999",   // for Germany: 5 digits without space
  // Add more country masks here...
};

export function usePostalCodeMask(countryCode?: string): string {
  // If no country or no mask defined for given country, return empty string
  return useMemo(() => {
    if (!countryCode) return "";
    return countryMasks[countryCode.toUpperCase()] || "";
  }, [countryCode]);
}
