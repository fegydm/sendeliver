/* File: src/hooks/useCountries.ts */
/* Last change: Added priority to CC over name in filterCountries */
import { useState, useEffect } from 'react';
import type { Country } from '@/types/transport-forms.types';

class CountriesManager {
  private static instance: CountriesManager;
  private countries: Country[] | null = null;
  private fetchPromise: Promise<Country[]> | null = null;
  private subscribers = new Set<(countries: Country[]) => void>();
  private fetchStartTime: number = 0;

  private constructor() {}

  static getInstance(): CountriesManager {
    if (!CountriesManager.instance) {
      CountriesManager.instance = new CountriesManager();
    }
    return CountriesManager.instance;
  }

  private async fetchCountries(): Promise<Country[]> {
    this.fetchStartTime = performance.now();
    console.log('Starting countries fetch...');
    try {
      const response = await fetch('/api/geo/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      const transformedData = data.map((country: any) => {
        const { code_2, ...rest } = country;
        return { ...rest, cc: code_2 };
      });
      const duration = Math.round(performance.now() - this.fetchStartTime);
      console.log(`Countries fetched: ${transformedData.length} items in ${duration}ms`);
      return transformedData;
    } catch (error) {
      const duration = Math.round(performance.now() - this.fetchStartTime);
      console.error(`Countries fetch failed after ${duration}ms:`, error);
      throw error;
    }
  }

  subscribe(callback: (countries: Country[]) => void) {
    if (this.countries) {
      console.log('Returning cached countries to new subscriber');
      callback(this.countries);
      return () => {};
    }
    this.subscribers.add(callback);
    console.log('New subscriber added, total:', this.subscribers.size);
    if (!this.fetchPromise) {
      this.getCountries().catch(error => console.error('Failed to fetch countries:', error));
    }
    return () => {
      this.subscribers.delete(callback);
      console.log('Subscriber removed, total:', this.subscribers.size);
    };
  }

  private notify() {
    if (this.countries) {
      console.log('Notifying subscribers:', this.subscribers.size);
      this.subscribers.forEach(callback => callback(this.countries!));
    }
  }

  async getCountries(): Promise<Country[]> {
    if (this.countries) {
      console.log('Using cached countries');
      return this.countries;
    }
    if (this.fetchPromise) {
      console.log('Using existing fetch promise');
      return this.fetchPromise;
    }
    this.fetchPromise = this.fetchCountries()
      .then(data => {
        this.countries = data;
        this.notify();
        data.forEach(country => {
          if (country.cc) {
            const img = new Image();
            img.src = `/flags/4x3/optimized/${country.cc.toLowerCase()}.svg`;
          }
        });
        return data;
      })
      .finally(() => this.fetchPromise = null);
    return this.fetchPromise;
  }
}

const countriesManager = CountriesManager.getInstance();

export function useCountries() {
  const [items, setItems] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = countriesManager.subscribe(countries => {
      setItems(countries);
      setLoading(false);
    });
    countriesManager.getCountries().catch(error => {
      console.error('Failed to fetch countries:', error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filterCountries = (query: string): Country[] => {
    if (!query) return items;
    const upperQuery = query.toUpperCase();
    const ccMatches = items.filter(country => country.cc?.startsWith(upperQuery));
    const nameMatches = items.filter(country => 
      country.name_en.toUpperCase().includes(upperQuery) && !ccMatches.includes(country)
    );
    return [...ccMatches, ...nameMatches];
  };

  return {
    items,
    isLoading: loading,
    filterCountries
  };
}

export default useCountries;