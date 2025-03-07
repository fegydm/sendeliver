/* File: src/hooks/useCountries.ts */
/* Last change: Added detailed logging and fallback for failed API calls */

import { useState, useEffect } from 'react';
import type { Country } from '@/types/transport-forms.types';

class CountriesManager {
  private static instance: CountriesManager;
  private countries: Country[] | null = null;
  private fetchPromise: Promise<Country[]> | null = null;
  private subscribers = new Set<(countries: Country[]) => void>();
  private fetchStartTime: number = 0;

  private constructor() {
    console.log('🔧 CountriesManager instance created');
  }

  static getInstance(): CountriesManager {
    if (!CountriesManager.instance) {
      CountriesManager.instance = new CountriesManager();
    }
    return CountriesManager.instance;
  }

  private async fetchCountries(): Promise<Country[]> {
    this.fetchStartTime = performance.now();
    console.log('🚀 Starting countries fetch from /api/geo/countries');
    try {
      const response = await fetch('/api/geo/countries');
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('📦 Raw data received:', data);
      const transformedData = data.map((country: any) => {
        const { code_2, ...rest } = country;
        return { ...rest, cc: code_2 };
      });
      const duration = Math.round(performance.now() - this.fetchStartTime);
      console.log(`✅ Countries fetched successfully: ${transformedData.length} items in ${duration}ms`);
      return transformedData;
    } catch (error) {
      const duration = Math.round(performance.now() - this.fetchStartTime);
      console.error(`❌ Countries fetch failed after ${duration}ms:`, error instanceof Error ? error.message : error);
      console.warn('⚠️ Using empty array as fallback due to fetch failure');
      return []; // Fallback na prázdne pole
    }
  }

  subscribe(callback: (countries: Country[]) => void) {
    console.log('📥 New subscription request');
    if (this.countries) {
      console.log('✅ Returning cached countries to subscriber:', this.countries.length);
      callback(this.countries);
      return () => {};
    }
    this.subscribers.add(callback);
    console.log('➕ Subscriber added, total:', this.subscribers.size);
    if (!this.fetchPromise) {
      console.log('🔄 Initiating fetch due to new subscriber');
      this.getCountries().catch(error => console.error('Failed to fetch countries in subscribe:', error));
    }
    return () => {
      this.subscribers.delete(callback);
      console.log('➖ Subscriber removed, total:', this.subscribers.size);
    };
  }

  private notify() {
    if (this.countries) {
      console.log('📢 Notifying subscribers:', this.subscribers.size);
      this.subscribers.forEach(callback => callback(this.countries!));
    } else {
      console.warn('⚠️ No countries to notify subscribers about');
    }
  }

  async getCountries(): Promise<Country[]> {
    if (this.countries) {
      console.log('✅ Using cached countries:', this.countries.length);
      return this.countries;
    }
    if (this.fetchPromise) {
      console.log('🔄 Using existing fetch promise');
      return this.fetchPromise;
    }
    console.log('🚀 Starting new countries fetch');
    this.fetchPromise = this.fetchCountries()
      .then(data => {
        this.countries = data;
        console.log('📥 Countries cached:', data.length);
        this.notify();
        data.forEach(country => {
          if (country.cc) {
            console.log(`🏳️ Preloading flag for ${country.cc}`);
            const img = new Image();
            img.src = `/flags/4x3/optimized/${country.cc.toLowerCase()}.svg`;
          }
        });
        return data;
      })
      .finally(() => {
        console.log('🏁 Fetch promise completed');
        this.fetchPromise = null;
      });
    return this.fetchPromise;
  }
}

const countriesManager = CountriesManager.getInstance();

export function useCountries() {
  const [items, setItems] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useCountries hook mounted');
    const unsubscribe = countriesManager.subscribe(countries => {
      console.log('📥 Received countries update:', countries.length);
      setItems(countries);
      setLoading(false);
    });
    countriesManager.getCountries().catch(error => {
      console.error('Failed to fetch countries in useEffect:', error);
      setLoading(false); // Ukončíme načítavanie aj pri chybe
    });
    return () => {
      console.log('🧹 Cleaning up useCountries hook');
      unsubscribe();
    };
  }, []);

  const filterCountries = (query: string): Country[] => {
    if (!query) {
      console.log('🔍 No query, returning all items:', items.length);
      return items;
    }
    const upperQuery = query.toUpperCase();
    const ccMatches = items.filter(country => country.cc?.startsWith(upperQuery));
    const nameMatches = items.filter(country => 
      country.name_en.toUpperCase().includes(upperQuery) && !ccMatches.includes(country)
    );
    console.log(`🔍 Filter results - CC matches: ${ccMatches.length}, Name matches: ${nameMatches.length}`);
    return [...ccMatches, ...nameMatches];
  };

  return {
    items,
    isLoading: loading,
    filterCountries
  };
}

export default useCountries;