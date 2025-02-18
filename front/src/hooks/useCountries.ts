// File: src/hooks/useCountries.ts
// Last change: Updated types and improved single-fetch pattern

import { useState, useEffect } from 'react';
import type { Country } from '@/types/location.types';

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
    console.log('🔄 Starting countries fetch...');
    
    try {
      const response = await fetch('/api/geo/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      
      const data = await response.json();
      const duration = Math.round(performance.now() - this.fetchStartTime);
      
      // Transform API response to match our unified types
      const transformedCountries: Country[] = data.results.map((country: any) => ({
        cc: country.code_2, // Map old code_2 to new cc
        name_en: country.name_en,
        name_sk: country.name_sk,
        name_local: country.name_local,
        logistics_priority: country.logistics_priority,
        flag: `/flags/4x3/optimized/${country.code_2.toLowerCase()}.svg`,
        code_3: country.code_3,
        numeric_code: country.numeric_code,
        phone_code: country.phone_code,
        continent_id: country.continent_id,
        is_eu: country.is_eu,
        capital_en: country.capital_en,
        currency_code: country.currency_code,
        driving_side: country.driving_side,
        created_at: new Date(country.created_at),
        updated_at: new Date(country.updated_at),
        is_schengen: country.is_schengen,
        area_km2: country.area_km2,
      }));

      console.log(`✅ Countries fetched and transformed: ${transformedCountries.length} items in ${duration}ms`);
      
      return transformedCountries;
    } catch (error) {
      const duration = Math.round(performance.now() - this.fetchStartTime);
      console.error(`❌ Countries fetch failed after ${duration}ms:`, error);
      throw error;
    }
  }

  subscribe(callback: (countries: Country[]) => void) {
    if (this.countries) {
      console.log('📦 Returning cached countries to new subscriber');
      callback(this.countries);
      return () => {};
    }

    this.subscribers.add(callback);
    console.log('👥 New subscriber added, total:', this.subscribers.size);

    return () => {
      this.subscribers.delete(callback);
      console.log('👋 Subscriber removed, total:', this.subscribers.size);
    };
  }

  private notify() {
    if (this.countries) {
      console.log('📢 Notifying subscribers:', this.subscribers.size);
      this.subscribers.forEach(callback => callback(this.countries!));
      this.subscribers.clear();
    }
  }

  async getCountries(): Promise<Country[]> {
    // Return cached data if available
    if (this.countries) {
      console.log('📦 Using cached countries');
      return this.countries;
    }

    // Return existing promise if fetch is in progress
    if (this.fetchPromise) {
      console.log('⏳ Using existing fetch promise');
      return this.fetchPromise;
    }

    // Start new fetch
    this.fetchPromise = this.fetchCountries()
      .then(data => {
        this.countries = data;
        this.notify();

        // Preload flags in background
        data.forEach(country => {
          if (country.cc) {
            const img = new Image();
            img.src = `/flags/4x3/optimized/${country.cc.toLowerCase()}.svg`;
          }
        });

        return data;
      })
      .finally(() => {
        this.fetchPromise = null;
      });

    return this.fetchPromise;
  }
}

// Create single instance at module level
const countriesManager = CountriesManager.getInstance();

export function useCountries() {
  const [items, setItems] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = countriesManager.subscribe(countries => {
      setItems(countries);
      setLoading(false);
    });

    // Trigger fetch
    countriesManager.getCountries().catch(error => {
      console.error('Failed to fetch countries:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filterCountries = (query: string): Country[] => {
    if (!query) return items;
    const upperQuery = query.toUpperCase();
    return items.filter(country => 
      country.cc.startsWith(upperQuery)
    );
  };

  return {
    items,
    isLoading: loading,
    filterCountries
  };
}

export default useCountries;