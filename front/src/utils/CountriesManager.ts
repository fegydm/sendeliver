/* File: src/utils/CountriesManager.ts */
/* Singleton for managing countries data with optimized loading */

import type { Country } from '@/types/transport-forms.types';

export class CountriesManager {
  private static instance: CountriesManager;
  private countries: Country[] | null = null;
  private fetchPromise: Promise<Country[]> | null = null;
  private subscribers = new Set<(countries: Country[]) => void>();
  private fetchStartTime: number = 0;
  private flagsMap: Record<string, string> = {};

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
      console.log(`📦 Data received: ${data.length} countries`);
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
      return []; // Fallback to empty array
    }
  }

  subscribe(callback: (countries: Country[]) => void): () => void {
    console.log('📥 New subscription request to CountriesManager');
    if (this.countries) {
      console.log(`✅ Returning cached countries to subscriber: ${this.countries.length}`);
      callback(this.countries);
      return () => {};
    }
    this.subscribers.add(callback);
    console.log(`➕ Subscriber added, total: ${this.subscribers.size}`);
    if (!this.fetchPromise) {
      console.log('🔄 Initiating fetch due to new subscriber');
      this.getCountries().catch(error => console.error('Failed to fetch countries in subscribe:', error));
    }
    return () => {
      this.subscribers.delete(callback);
      console.log(`➖ Subscriber removed, total: ${this.subscribers.size}`);
    };
  }

  private notify() {
    if (this.countries) {
      console.log(`📢 Notifying ${this.subscribers.size} subscribers about countries`);
      this.subscribers.forEach(callback => callback(this.countries!));
    } else {
      console.warn('⚠️ No countries to notify subscribers about');
    }
  }

  async getCountries(): Promise<Country[]> {
    if (this.countries) {
      console.log(`✅ Using cached countries: ${this.countries.length}`);
      return this.countries;
    }
    if (this.fetchPromise) {
      console.log('🔄 Using existing fetch promise for countries');
      return this.fetchPromise;
    }
    console.log('🚀 Starting new countries fetch');
    this.fetchPromise = this.fetchCountries()
      .then(data => {
        this.countries = data;
        console.log(`📥 Countries cached: ${data.length}`);
        
        // Build flags map as we receive country data
        data.forEach(country => {
          if (country.cc) {
            const flagUrl = `/flags/4x3/optimized/${country.cc.toLowerCase()}.svg`;
            this.flagsMap[country.cc.toLowerCase()] = flagUrl;
            
            // Preload flag images in background
            console.log(`🏳️ Preloading flag for ${country.cc}`);
            const img = new Image();
            img.src = flagUrl;
          }
        });
        
        this.notify();
        return data;
      })
      .finally(() => {
        console.log('🏁 Countries fetch promise completed');
        this.fetchPromise = null;
      });
    return this.fetchPromise;
  }
  
  // Get flag URL for a country or language code
  getFlagUrl(code: string): string {
    const lowerCode = code.toLowerCase();
    return this.flagsMap[lowerCode] || `/flags/4x3/optimized/${lowerCode}.svg`;
  }
  
  // Get all available flag URLs
  getFlagsMap(): Record<string, string> {
    return { ...this.flagsMap };
  }
}

export default CountriesManager.getInstance();