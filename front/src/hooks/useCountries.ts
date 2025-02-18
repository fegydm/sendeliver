// File: src/hooks/useCountries.ts
// Last change: Replaced code_2 with cc while maintaining original structure

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
      
      // Map code_2 na cc
      const transformedData = data.map((country: any) => ({
        ...country,
        cc: country.code_2  // Changed code_2 to cc
      }));

      const duration = Math.round(performance.now() - this.fetchStartTime);
      console.log(`✅ Countries fetched: ${transformedData.length} items in ${duration}ms`);
      
      return transformedData;
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

    // Trigger fetch only if needed
    if (!countriesManager.getCountries()) {
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  const filterCountries = (query: string): Country[] => {
    if (!query) return items;
    const upperQuery = query.toUpperCase();
    return items.filter(country => country.cc?.startsWith(upperQuery));
  };

  return {
    items,
    isLoading: loading,
    filterCountries
  };
}

export default useCountries;