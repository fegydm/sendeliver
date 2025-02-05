// File: src/hooks/location/useCountryField.ts
// Last change: Created country-specific field hook

import { useFormField } from '@/hooks/useFormField';
import { useAsyncSelect } from '@/hooks/useAsyncSelect';
import type { Country } from '@/types/location.types';

interface UseCountryFieldProps {
  onSelect: (country: Country) => void;
}

export function useCountryField({ onSelect }: UseCountryFieldProps) {
  const field = useFormField<string>({
    initialValue: '',
    validate: async (value) => value.length === 2,
  });

  const select = useAsyncSelect<Country>({
    fetchItems: async (query) => {
      const response = await fetch(`/api/geo/countries?query=${query}`);
      return response.json();
    },
    onSelect: (country) => {
      field.handleChange(country.code_2);
      onSelect(country);
    },
    itemToString: (country) => `${country.code_2} - ${country.name_en}`
  });

  return {
    ...field,
    ...select,
  };
}
