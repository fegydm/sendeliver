// File: src/context/CountriesContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Country {
  code_2: string;
  name_en: string;
  name_local: string;
  name_sk: string;
}

interface CountriesContextType {
  countries: Country[];
}

let isFetching = false;
let cachedCountries: Country[] = [];

const CountriesContext = createContext<CountriesContextType>({ countries: [] });

const CountriesProvider = ({ children }: { children: React.ReactNode }) => {
  const [countries, setCountries] = useState<Country[]>(cachedCountries);

  useEffect(() => {
    const fetchCountries = async () => {
      if (isFetching || cachedCountries.length > 0) return;
      
      try {
        isFetching = true;
        const response = await fetch("/api/geo/countries");
        if (!response.ok) throw new Error("Failed to fetch countries");
        
        const data: Country[] = await response.json();
        const sortedData = data.sort((a, b) => a.code_2.localeCompare(b.code_2));
        
        cachedCountries = sortedData;
        setCountries(sortedData);
      } catch (error) {
        console.error("Failed to load countries:", error);
        isFetching = false;
      }
    };

    fetchCountries();
  }, []);

  return (
    <CountriesContext.Provider value={{ countries }}>
      {children}
    </CountriesContext.Provider>
  );
};

const useCountries = () => {
  const context = useContext(CountriesContext);
  if (!context) {
    throw new Error('useCountries must be used within a CountriesProvider');
  }
  return context;
};

export { CountriesProvider, useCountries };