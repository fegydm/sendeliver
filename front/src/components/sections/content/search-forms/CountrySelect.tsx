// File: src/components/sections/content/search-forms/CountrySelect.tsx
// Last change: Removed useUINavigation (now handled in BaseDropdown)

import { useRef, useState, useMemo, useEffect } from "react";
import { useLocation } from "./LocationContext";
import { BaseDropdown, type LocationType } from "./BaseDropdown";
import { COUNTRY_PAGE_SIZE, MAX_COUNTRIES, UI_PAGE_SIZE } from "@/constants/pagination.constants";
import type { Country } from "@/types/location.types";

interface CountrySelectProps {
  onCountrySelect: (code: string, flag: string) => void;
  onNextFieldFocus?: () => void;
  initialValue?: string;
  locationType: LocationType;
  pageSize?: number;
}

export function CountrySelect({
  onCountrySelect,
  onNextFieldFocus,
  initialValue = "",
  locationType,
  pageSize = COUNTRY_PAGE_SIZE,
}: CountrySelectProps) {
  const { country, countrySelect } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (countrySelect.items.length === 0) {
      countrySelect.search("", pageSize);
    }
  }, [pageSize]);

  const loadMoreCountries = (lastItem: Country | null) => {
    if (lastItem) {
      countrySelect.loadMore(lastItem.code_2, pageSize);
    }
  };

  return (
    <BaseDropdown<Country>
      items={countrySelect.items}
      isOpen={isOpen && countrySelect.items.length > 0}
      onSelect={(selectedCountry) => {
        if (!selectedCountry.code_2) return;
        const countryCode = selectedCountry.code_2;
        const flagUrl = `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;
        setInputValue(countryCode);
        country.setValue(selectedCountry);
        setIsOpen(false);
        onCountrySelect(countryCode, flagUrl);
        onNextFieldFocus?.();
      }}
      onClose={() => setIsOpen(false)}
      inputRef={inputRef}
      dropdownType="country"
      locationType={locationType}
      pageSize={UI_PAGE_SIZE} // Now passing page size
      onLoadMore={pageSize >= MAX_COUNTRIES ? undefined : loadMoreCountries}
      totalItems={MAX_COUNTRIES}
      isSinglePage={pageSize >= MAX_COUNTRIES}
      renderItem={(country: Country, { isHighlighted }) => (
        <div className={`item-suggestion ${isHighlighted ? "highlighted" : ""}`}>
          <img src={`/flags/4x3/optimized/${country.code_2?.toLowerCase()}.svg`} alt={`${country.code_2 ?? "Unknown"} flag`} className="country-flag" />
          <span className="country-code">{country.code_2 ?? "--"}</span>
          <span className="country-name">{country.name_en}</span>
          <span className="country-local">({country.name_local})</span>
        </div>
      )}
    />
  );
}

export default CountrySelect;
