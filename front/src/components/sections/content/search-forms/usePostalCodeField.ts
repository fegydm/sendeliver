// File: src/hooks/location/usePostalCodeField.ts
// Last change: Created postal code field hook

import { useFormField } from '@/hooks/useFormField';
import type { LocationSuggestion } from '@/types/location.types';

interface UsePostalCodeFieldProps {
  countryCode: string;
  onValidate: (postalCode: string) => Promise<LocationSuggestion[]>;
}

export function usePostalCodeField({ countryCode, onValidate }: UsePostalCodeFieldProps) {
  const field = useFormField<string>({
    initialValue: '',
    validate: async (value) => {
      if (!value || !countryCode) return false;
      const suggestions = await onValidate(value);
      return suggestions.length > 0;
    },
  });

  return {
    ...field
  };
}
