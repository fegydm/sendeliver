// File: src/hooks/ocation/useCityField.ts
// Last change: Created city field hook

import { useFormField } from '@/hooks/useFormField';
import type { LocationSuggestion } from '@/types/form-manual.types';

interface UseCityFieldProps {
  countryCode: string;
  postalCode: string;
  onValidate: (city: string) => Promise<LocationSuggestion[]>;
}

export function useCityField({ countryCode, postalCode, onValidate }: UseCityFieldProps) {
  const field = useFormField<string>({
    initialValue: '',
    validate: async (value) => {
      if (!value || !countryCode || !postalCode) return false;
      const suggestions = await onValidate(value);
      return suggestions.ength > 0;
    },
  });

  return {
    ...field
  };
}