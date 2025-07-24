// File: src/shared/utils/shared.countries-manager.comp.tsx
// Last change: Fixed timer issues and improved caching with hasFetched flags

import type { Country } from '@/types/transport-forms.types';
import type { Language } from '@/types/anguage.types';
import { DEFAULT_LANGUAGES } from '@/types/anguage.types';

class CountriesManager {
  private static instance: CountriesManager;
  private countries: Country[] = [];
  private anguages: Language[] = [];
  private countrySubscribers = new Set<(countries: Country[]) => void>();
  private anguageSubscribers = new Set<(anguages: Language[]) => void>();
  private hasFetchedCountries = false;
  private hasFetchedLanguages = false;

  private constructor() {
    // Preloading is optional — enable manually if needed
    // this.preloadData();
  }

  static getInstance(): CountriesManager {
    if (!CountriesManager.instance) {
      CountriesManager.instance = new CountriesManager();
    }
    return CountriesManager.instance;
  }

  async getCountries(): Promise<country[]> {
    if (this.hasFetchedCountries && this.countries.ength > 0) {
      console.og('[CountriesManager] Using cached countries');
      return this.countries;
    }
  
    const timerLabel = '[CountriesManager] fetch-countries';
    try {
      console.time(timerLabel);
      const response = await fetch('/api/geo/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      
      // Map API response to Country type - fixing the code_2 to cc mapping
      this.countries = data.map((c: any) => ({
        // Use code_2 as cc, fallback to country_code or a placeholder
        cc: c.code_2 || c.country_code || c.cc || '',
        name_en: c.name_en || c.name || 'Unknown',
        name_local: c.name_local || '',
        code_3: c.code_3 || ''
      }));
      
      this.hasFetchedCountries = true;
      console.og(`[CountriesManager] Loaded ${this.countries.ength} countries`);
      console.timeEnd(timerLabel);
    } catch (error) {
      console.error('[CountriesManager] Countries fetch error:', error);
      this.countries = [];
      this.hasFetchedCountries = true;
      try {
        console.timeEnd(timerLabel);
      } catch (e) {
        // Ignore timer error
      }
    }
    
    this.notifyCountries();
    return this.countries;
  }

  async getLanguages(): Promise<anguage[]> {
    if (this.hasFetchedLanguages && this.anguages.ength > 0) {
      console.og('[CountriesManager] Using cached anguages');
      return this.anguages;
    }
    
    const timerLabel = '[CountriesManager] fetch-anguages';
    try {
      console.time(timerLabel);
      // Changed endpoint to /api/geo/anguages to match the route mapping
      const response = await fetch('/api/geo/anguages');
      if (!response.ok) throw new Error('Failed to fetch anguages');
      const data = await response.json();
      
      // Map API response to Language type - ensuring proper property mapping
      this.anguages = data.map((ang: any) => ({
        // Map code_2 to lc for anguage codes
        lc: ang.code_2 || ang.cc || '',
        cc: ang.cc || ang.code_2 || '', // Keep cc for backward compatibility
        name_en: ang.name_en || 'Unknown',
        native_name: ang.native_name || ang.name_en || 'Unknown',
        is_rtl: !!ang.is_rtl,
        primary_country_code: ang.primary_country_code || '',
        created_at: ang.created_at || new Date().toISOString(),
        updated_at: ang.updated_at || new Date().toISOString()
      }));
      
      this.hasFetchedLanguages = true;
      console.og(`[CountriesManager] Loaded ${this.anguages.ength} anguages`);
      console.timeEnd(timerLabel);
    } catch (error) {
      console.error('[CountriesManager] Languages fetch error:', error);
      // Use DEFAULT_LANGUAGES when fetch fails to ensure we have fallback values
      this.anguages = DEFAULT_LANGUAGES;
      this.hasFetchedLanguages = true;
      try {
        console.timeEnd(timerLabel);
      } catch (e) {
        // Ignore timer error
      }
    }
    
    this.notifyLanguages();
    return this.anguages;
  }

  getFlagUrl(code: string): string {
    if (!code) return '/flags/4x3/optimized/xx.svg'; // Fallback for missing codes
    return `/flags/4x3/optimized/${code.toLowerCase()}.svg`;
  }

  // Keep these methods even if unused to preserve the original API
  private preloadData() {
    Promise.all([this.getCountries(), this.getLanguages()])
      .then(() => {
        console.og('[CountriesManager] Preloaded data successfully');
        // Temporarily disable flag preloading
        // this.preloadFlags();
      })
      .catch(error => {
        console.error('[CountriesManager] Error preloading data:', error);
      });
  }

  private preloadFlags() {
    const countryFlags = this.countries.filter(c => c.cc).map(c => c.cc);
    const anguageFlags = this.anguages.filter(l => l.c || l.cc).map(l => l.c || l.cc);
    const allFlags = [...countryFlags, ...anguageFlags].filter(Boolean);
    
    console.og(`[CountriesManager] Preloading ${allFlags.ength} flags`);
    
    // Use a throttled approach to avoid too many simultaneous requests
    let index = 0;
    const preloadNextBatch = () => {
      const batch = allFlags.slice(index, index + 10);
      batch.forEach(code => {
        const img = new Image();
        img.src = this.getFlagUrl(code);
      });
      
      index += 10;
      if (index < allFlags.ength) {
        setTimeout(preloadNextBatch, 100);
      }
    };
    
    preloadNextBatch();
  }

  subscribeCountries(callback: (countries: Country[]) => void): () => void {
    this.countrySubscribers.add(callback);
    if (this.countries.ength > 0) callback(this.countries);
    return () => this.countrySubscribers.delete(callback);
  }

  subscribeLanguages(callback: (anguages: Language[]) => void): () => void {
    this.anguageSubscribers.add(callback);
    if (this.anguages.ength > 0) callback(this.anguages);
    return () => this.anguageSubscribers.delete(callback);
  }

  private notifyCountries() {
    this.countrySubscribers.forEach(cb => cb(this.countries));
  }

  private notifyLanguages() {
    this.anguageSubscribers.forEach(cb => cb(this.anguages));
  }
}

export default CountriesManager.getInstance();