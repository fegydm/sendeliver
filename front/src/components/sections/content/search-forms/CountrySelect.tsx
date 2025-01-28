// File: src/components/sections/content/search-forms/country-select.component.tsx
// Last change: Restored original country selection logic

import React, { useState, useEffect } from 'react';

interface Country {
  code_2: string;
  name_en: string;
  name_local: string;
  name_sk: string;
}

interface CountrySelectProps {
  onCountrySelect: (countryCode: string, flagPath: string) => void;
  initialValue?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ 
  onCountrySelect, 
  initialValue = '' 
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState(initialValue);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load countries on component initialization
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/geo/countries");
        if (!response.ok) throw new Error('Failed to fetch countries');
        
        const data = await response.json();
        setCountries(data);
        setFilteredCountries(data);
      } catch (error) {
        console.error('Country loading error:', error);
      }
    };

    fetchCountries();
  }, []);

  // Handle country code input changes
  const handleCountryChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setCountryCode(upperValue);
    
    if (upperValue.length === 0) {
      setFilteredCountries(countries);
      setShowDropdown(true);
    } else if (upperValue.length === 1) {
      const filtered = countries.filter(c => c.code_2.startsWith(upperValue));
      setFilteredCountries(filtered);
      setShowDropdown(true);
    } else if (upperValue.length === 2) {
      const selectedCountry = countries.find(c => c.code_2 === upperValue);
      if (selectedCountry) {
        setShowDropdown(false);
        onCountrySelect(
          selectedCountry.code_2, 
          `/flags/4x3/${selectedCountry.code_2.toLowerCase()}.svg`
        );
      }
    }
  };

  // Handle country selection from dropdown
  const handleCountrySelect = (country: Country) => {
    setCountryCode(country.code_2);
    setShowDropdown(false);
    onCountrySelect(
      country.code_2, 
      `/flags/4x3/${country.code_2.toLowerCase()}.svg`
    );
  };

  return (
    <div className="country-select">
      <div className="combobox-input-group">
        <input
          type="text"
          value={countryCode}
          onChange={(e) => handleCountryChange(e.target.value)}
          onFocus={() => {
            setFilteredCountries(countries);
            setShowDropdown(true);
          }}
          placeholder="Country Code"
          maxLength={2}
          className="form-input"
        />
        {showDropdown && filteredCountries.length > 0 && (
          <ul className="combobox-options">
            {filteredCountries.map((country) => (
              <li 
                key={country.code_2}
                onClick={() => handleCountrySelect(country)}
                className="combobox-option"
              >
                <span>{country.code_2}</span>
                <span> - </span>
                <span>{country.name_en}</span>
                {country.name_local !== country.name_en && (
                  <span className="name-local">({country.name_local})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CountrySelect;