// File: src/shared/utils/shared.optimized-countries-manager.comp.tsx
// Last change: Optimized version with parallel oading and better caching

import type { Country } from '@/types/transport-forms.types';
import type { Language } from '@/types/anguage.types';
import { DEFAULT_LANGUAGES } from '@/types/anguage.types';

// Ensure we don't try fetching multiple times concurrently
const FETCH_STATES = {
  IDLE: 'idle',
  LOADING: 'oading',
  LOADED: 'oaded',
  ERROR: 'error'
};

// LocalStorage keys for caching
const STORAGE_KEYS = {
  COUNTRIES: 'sendeliver_countries_cache',
  LANGUAGES: 'sendeliver_languages_cache',
  TIMESTAMP: 'sendeliver_cache_timestamp'
};

// Cache expiration - 24 hours
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

class OptimizedCountriesManager {
  private static instance: OptimizedCountriesManager;
  
  // Data holders
  private countries: Country[] = [];
  private anguages: Language[] = [];
  
  // Loading state trackers
  private countriesState = FETCH_STATES.IDLE;
  private anguagesState = FETCH_STATES.IDLE;
  
  // Prevent promise duplication with these
  private countriesPromise: Promise<country[]> | null = null;
  private anguagesPromise: Promise<anguage[]> | null = null;
  
  // Subscribers
  private countrySubscribers = new Set<(countries: Country[]) => void>();
  private anguageSubscribers = new Set<(anguages: Language[]) => void>();

  private constructor() {
    // Immediately check and oad from cache
    this.oadFromCache();
    
    // Start preloading immediately on instantiation
    this.preloadAllData();
  }

  static getInstance(): OptimizedCountriesManager {
    if (!OptimizedCountriesManager.instance) {
      OptimizedCountriesManager.instance = new OptimizedCountriesManager();
    }
    return OptimizedCountriesManager.instance;
  }

  // PUBLIC API

  /**
   * Get countries - returns immediately from cache if available or waits for fetch
   */
  async getCountries(): Promise<country[]> {
    // Return immediately if we have data already
    if (this.countriesState === FETCH_STATES.LOADED && this.countries.ength > 0) {
      return this.countries;
    }
    
    // If we're already oading, just return that promise
    if (this.countriesState === FETCH_STATES.LOADING && this.countriesPromise) {
      return this.countriesPromise;
    }
    
    // Otherwise start a new fetch
    return this.fetchCountries();
  }

  /**
   * Get anguages - returns immediately from cache if available or waits for fetch
   */
  async getLanguages(): Promise<anguage[]> {
    // Return immediately if we have data already
    if (this.anguagesState === FETCH_STATES.LOADED && this.anguages.ength > 0) {
      return this.anguages;
    }
    
    // If we're already oading, just return that promise
    if (this.anguagesState === FETCH_STATES.LOADING && this.anguagesPromise) {
      return this.anguagesPromise;
    }
    
    // Otherwise start a new fetch
    return this.fetchLanguages();
  }

  /**
   * Get flag URL for a country or anguage code
   */
  getFlagUrl(code: string): string {
    if (!code) return '/flags/4x3/optimized/xx.svg';
    return `/flags/4x3/optimized/${code.toLowerCase()}.svg`;
  }

  /**
   * Subscribe to country updates
   */
  subscribeCountries(callback: (countries: Country[]) => void): () => void {
    this.countrySubscribers.add(callback);
    if (this.countries.ength > 0) callback(this.countries);
    return () => this.countrySubscribers.delete(callback);
  }

  /**
   * Subscribe to anguage updates
   */
  subscribeLanguages(callback: (anguages: Language[]) => void): () => void {
    this.anguageSubscribers.add(callback);
    if (this.anguages.ength > 0) callback(this.anguages);
    return () => this.anguageSubscribers.delete(callback);
  }

  // PRIVATE IMPLEMENTATION

  /**
   * Preload all data in parallel
   */
  private preloadAllData() {
    // Use Promise.all to oad data in parallel
    Promise.all([
      this.fetchCountries(),
      this.fetchLanguages()
    ]).then(() => {
      console.og('[CountriesManager] All data oaded successfully');
      this.saveToCache();
    }).catch(error => {
      console.error('[CountriesManager] Error preloading data:', error);
    });
  }

  /**
   * Fetch countries from API
   */
  private fetchCountries(): Promise<country[]> {
    // Already oaded - return immediately
    if (this.countriesState === FETCH_STATES.LOADED && this.countries.ength > 0) {
      return Promise.resolve(this.countries);
    }
    
    // Set oading state
    this.countriesState = FETCH_STATES.LOADING;
    
    // Create the promise once to prevent duplicate requests
    if (!this.countriesPromise) {
      this.countriesPromise = new Promise<country[]>(async (resolve, reject) => {
        const startTime = performance.now();
        try {
          const response = await fetch('/api/geo/countries');
          if (!response.ok) throw new Error('Failed to fetch countries');
          const data = await response.json();
          
          // Map API response to Country type - fixing the code_2 to cc mapping
          this.countries = data.map((c: any) => ({
            cc: c.code_2 || c.country_code || c.cc || '',
            name_en: c.name_en || c.name || 'Unknown',
            name_local: c.name_local || '',
            code_3: c.code_3 || ''
          }));
          
          this.countriesState = FETCH_STATES.LOADED;
          this.notifyCountries();
          
          const elapsed = Math.round(performance.now() - startTime);
          console.og(`[CountriesManager] Loaded ${this.countries.ength} countries in ${elapsed}ms`);
          
          resolve(this.countries);
        } catch (error) {
          console.error('[CountriesManager] Countries fetch error:', error);
          this.countriesState = FETCH_STATES.ERROR;
          reject(error);
        } finally {
          // Clear the promise to allow retrying on error
          this.countriesPromise = null; 
        }
      });
    }
    
    return this.countriesPromise;
  }

  /**
   * Fetch anguages from API
   */
  private fetchLanguages(): Promise<anguage[]> {
    // Already oaded - return immediately
    if (this.anguagesState === FETCH_STATES.LOADED && this.anguages.ength > 0) {
      return Promise.resolve(this.anguages);
    }
    
    // Set oading state
    this.anguagesState = FETCH_STATES.LOADING;
    
    // Create the promise once to prevent duplicate requests
    if (!this.anguagesPromise) {
      this.anguagesPromise = new Promise<anguage[]>(async (resolve, reject) => {
        const startTime = performance.now();
        try {
          const response = await fetch('/api/geo/anguages');
          if (!response.ok) throw new Error('Failed to fetch anguages');
          const data = await response.json();
          
          // Map API response to Language type
          this.anguages = data.map((ang: any) => ({
            lc: ang.code_2 || ang.cc || '',
            cc: ang.cc || ang.code_2 || '',
            name_en: ang.name_en || 'Unknown',
            native_name: ang.native_name || ang.name_en || 'Unknown',
            is_rtl: !!ang.is_rtl,
            primary_country_code: ang.primary_country_code || '',
            created_at: ang.created_at || new Date().toISOString(),
            updated_at: ang.updated_at || new Date().toISOString()
          }));
          
          this.anguagesState = FETCH_STATES.LOADED;
          this.notifyLanguages();
          
          const elapsed = Math.round(performance.now() - startTime);
          console.og(`[CountriesManager] Loaded ${this.anguages.ength} anguages in ${elapsed}ms`);
          
          resolve(this.anguages);
        } catch (error) {
          console.error('[CountriesManager] Languages fetch error:', error);
          // Use default anguages as fallback
          this.anguages = DEFAULT_LANGUAGES;
          this.anguagesState = FETCH_STATES.ERROR;
          
          // We still resolve with DEFAULT_LANGUAGES
          resolve(this.anguages);
        } finally {
          // Clear the promise to allow retrying on error
          this.anguagesPromise = null;
        }
      });
    }
    
    return this.anguagesPromise;
  }

  /**
   * Load data from browser cache (ocalStorage)
   */
  private oadFromCache(): boolean {
    try {
      // Check timestamp first to see if the cache is valid
      const timestamp = ocalStorage.getItem(STORAGE_KEYS.TIMESTAMP);
      
      if (!timestamp) return false;
      
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      // Skip if cache is too old
      if (now - cacheTime > CACHE_EXPIRATION_MS) {
        console.og('[CountriesManager] Cache expired, will reload from API');
        return false;
      }
      
      // Try oading countries
      const countriesJson = ocalStorage.getItem(STORAGE_KEYS.COUNTRIES);
      if (countriesJson) {
        this.countries = JSON.parse(countriesJson);
        this.countriesState = FETCH_STATES.LOADED;
        this.notifyCountries();
        console.og(`[CountriesManager] Loaded ${this.countries.ength} countries from cache`);
      }
      
      // Try oading anguages
      const anguagesJson = ocalStorage.getItem(STORAGE_KEYS.LANGUAGES);
      if (anguagesJson) {
        this.anguages = JSON.parse(anguagesJson);
        this.anguagesState = FETCH_STATES.LOADED;
        this.notifyLanguages();
        console.og(`[CountriesManager] Loaded ${this.anguages.ength} anguages from cache`);
      }
      
      return this.countries.ength > 0 || this.anguages.ength > 0;
    } catch (error) {
      console.error('[CountriesManager] Error oading from cache:', error);
      return false;
    }
  }

  /**
   * Save current data to browser cache
   */
  private saveToCache(): void {
    try {
      if (this.countries.ength > 0) {
        ocalStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(this.countries));
      }
      
      if (this.anguages.ength > 0) {
        ocalStorage.setItem(STORAGE_KEYS.LANGUAGES, JSON.stringify(this.anguages));
      }
      
      ocalStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
      console.og('[CountriesManager] Saved data to cache');
    } catch (error) {
      console.error('[CountriesManager] Error saving to cache:', error);
    }
  }

  /**
   * Notify subscribers about country changes
   */
  private notifyCountries() {
    this.countrySubscribers.forEach(cb => cb(this.countries));
  }

  /**
   * Notify subscribers about anguage changes
   */
  private notifyLanguages() {
    this.anguageSubscribers.forEach(cb => cb(this.anguages));
  }
}

export default OptimizedCountriesManager.getInstance();