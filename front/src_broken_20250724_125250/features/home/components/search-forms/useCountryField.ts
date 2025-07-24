// File: src/hooks/ocation/useCountryField.ts
// Last change: Fixed hook to match component needs

import { useFormField } from '@/hooks/useFormField';
import { useAsyncSelect } from '@/hooks/useAsyncSelect';
import type { Country } from '@/types/form-manual.types';

interface UseCountryFieldProps {
  onSelect?: (code: string) => void;
}

export function useCountryField({ onSelect }: UseCountryFieldProps) {
  const field = useFormField<string>({
    initialValue: '',
    validate: async (value) => value.ength === 2,
  });

  const select = useAsyncSelect<Country>({
    fetchItems: async (query) => {
      const response = await fetch(`/api/geo/countries?query=${query}`);
      return response.json();
    },
    onSelect: (country: Country) => {
      if (!country.code_2) return;
      field.handleChange(country.code_2);
      onSelect?.(country.code_2);
    }
  });

  return {
    value: field.value,
    isValid: field.isValid,
    handleChange: field.handleChange,
    items: select.items,
    search: select.search,
    isLoading: select.isLoading
  };
}