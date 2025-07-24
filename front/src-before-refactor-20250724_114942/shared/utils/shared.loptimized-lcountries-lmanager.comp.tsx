// File: src/shared/utils/shared.loptimized-lcountries-lmanager.comp.tsx
// Last change: Optimized version with parallel loading and better caching

import type { Country } from '@/types/transport-forms.types';
import type { Language } from '@/types/language.types';
import { DEFAULT_LANGUAGES } from '@/types/language.types';

// Ensure we don't try fetching multiple times concurrently
const FETCH_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  LOADED: 'loaded',
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
  private languages: Language[] = [];
  
  // Loading state trackers
  private countriesState = FETCH_STATES.IDLE;
  private languagesState = FETCH_STATES.IDLE;
  
  // Prevent promise duplication with these
  private countriesPromise: Promise<Country[]> | null = null;
  private languagesPromise: Promise<Language[]> | null = null;
  
  // Subscribers
  private countrySubscribers = new Set<(countries: Country[]) => void>();
  private languageSubscribers = new Set<(languages: Language[]) => void>();

  private constructor() {
    // Immediately check and load from cache
    this.loadFromCache();
    
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
  async getCountries(): Promise<Country[]> {
    // Return immediately if we have data already
    if (this.countriesState === FETCH_STATES.LOADED && this.countries.length > 0) {
      return this.countries;
    }
    
    // If we're already loading, just return that promise
    if (this.countriesState === FETCH_STATES.LOADING && this.countriesPromise) {
      return this.countriesPromise;
    }
    
    // Otherwise start a new fetch
    return this.fetchCountries();
  }

  /**
   * Get languages - returns immediately from cache if available or waits for fetch
   */
  async getLanguages(): Promise<Language[]> {
    // Return immediately if we have data already
    if (this.languagesState === FETCH_STATES.LOADED && this.languages.length > 0) {
      return this.languages;
    }
    
    // If we're already loading, just return that promise
    if (this.languagesState === FETCH_STATES.LOADING && this.languagesPromise) {
      return this.languagesPromise;
    }
    
    // Otherwise start a new fetch
    return this.fetchLanguages();
  }

  /**
   * Get flag URL for a country or language code
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
    if (this.countries.length > 0) callback(this.countries);
    return () => this.countrySubscribers.delete(callback);
  }

  /**
   * Subscribe to language updates
   */
  subscribeLanguages(callback: (languages: Language[]) => void): () => void {
    this.languageSubscribers.add(callback);
    if (this.languages.length > 0) callback(this.languages);
    return () => this.languageSubscribers.delete(callback);
  }

  // PRIVATE IMPLEMENTATION

  /**
   * Preload all data in parallel
   */
  private preloadAllData() {
    // Use Promise.all to load data in parallel
    Promise.all([
      this.fetchCountries(),
      this.fetchLanguages()
    ]).then(() => {
      console.log('[CountriesManager] All data loaded successfully');
      this.saveToCache();
    }).catch(error => {
      console.error('[CountriesManager] Error preloading data:', error);
    });
  }

  /**
   * Fetch countries from API
   */
  private fetchCountries(): Promise<Country[]> {
    // Already loaded - return immediately
    if (this.countriesState === FETCH_STATES.LOADED && this.countries.length > 0) {
      return Promise.resolve(this.countries);
    }
    
    // Set loading state
    this.countriesState = FETCH_STATES.LOADING;
    
    // Create the promise once to prevent duplicate requests
    if (!this.countriesPromise) {
      this.countriesPromise = new Promise<Country[]>(async (resolve, reject) => {
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
          console.log(`[CountriesManager] Loaded ${this.countries.length} countries in ${elapsed}ms`);
          
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
   * Fetch languages from API
   */
  private fetchLanguages(): Promise<Language[]> {
    // Already loaded - return immediately
    if (this.languagesState === FETCH_STATES.LOADED && this.languages.length > 0) {
      return Promise.resolve(this.languages);
    }
    
    // Set loading state
    this.languagesState = FETCH_STATES.LOADING;
    
    // Create the promise once to prevent duplicate requests
    if (!this.languagesPromise) {
      this.languagesPromise = new Promise<Language[]>(async (resolve, reject) => {
        const startTime = performance.now();
        try {
          const response = await fetch('/api/geo/languages');
          if (!response.ok) throw new Error('Failed to fetch languages');
          const data = await response.json();
          
          // Map API response to Language type
          this.languages = data.map((lang: any) => ({
            lc: lang.code_2 || lang.cc || '',
            cc: lang.cc || lang.code_2 || '',
            name_en: lang.name_en || 'Unknown',
            native_name: lang.native_name || lang.name_en || 'Unknown',
            is_rtl: !!lang.is_rtl,
            primary_country_code: lang.primary_country_code || '',
            created_at: lang.created_at || new Date().toISOString(),
            updated_at: lang.updated_at || new Date().toISOString()
          }));
          
          this.languagesState = FETCH_STATES.LOADED;
          this.notifyLanguages();
          
          const elapsed = Math.round(performance.now() - startTime);
          console.log(`[CountriesManager] Loaded ${this.languages.length} languages in ${elapsed}ms`);
          
          resolve(this.languages);
        } catch (error) {
          console.error('[CountriesManager] Languages fetch error:', error);
          // Use default languages as fallback
          this.languages = DEFAULT_LANGUAGES;
          this.languagesState = FETCH_STATES.ERROR;
          
          // We still resolve with DEFAULT_LANGUAGES
          resolve(this.languages);
        } finally {
          // Clear the promise to allow retrying on error
          this.languagesPromise = null;
        }
      });
    }
    
    return this.languagesPromise;
  }

  /**
   * Load data from browser cache (localStorage)
   */
  private loadFromCache(): boolean {
    try {
      // Check timestamp first to see if the cache is valid
      const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
      
      if (!timestamp) return false;
      
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      // Skip if cache is too old
      if (now - cacheTime > CACHE_EXPIRATION_MS) {
        console.log('[CountriesManager] Cache expired, will reload from API');
        return false;
      }
      
      // Try loading countries
      const countriesJson = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
      if (countriesJson) {
        this.countries = JSON.parse(countriesJson);
        this.countriesState = FETCH_STATES.LOADED;
        this.notifyCountries();
        console.log(`[CountriesManager] Loaded ${this.countries.length} countries from cache`);
      }
      
      // Try loading languages
      const languagesJson = localStorage.getItem(STORAGE_KEYS.LANGUAGES);
      if (languagesJson) {
        this.languages = JSON.parse(languagesJson);
        this.languagesState = FETCH_STATES.LOADED;
        this.notifyLanguages();
        console.log(`[CountriesManager] Loaded ${this.languages.length} languages from cache`);
      }
      
      return this.countries.length > 0 || this.languages.length > 0;
    } catch (error) {
      console.error('[CountriesManager] Error loading from cache:', error);
      return false;
    }
  }

  /**
   * Save current data to browser cache
   */
  private saveToCache(): void {
    try {
      if (this.countries.length > 0) {
        localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(this.countries));
      }
      
      if (this.languages.length > 0) {
        localStorage.setItem(STORAGE_KEYS.LANGUAGES, JSON.stringify(this.languages));
      }
      
      localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
      console.log('[CountriesManager] Saved data to cache');
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
   * Notify subscribers about language changes
   */
  private notifyLanguages() {
    this.languageSubscribers.forEach(cb => cb(this.languages));
  }
}

export default OptimizedCountriesManager.getInstance();