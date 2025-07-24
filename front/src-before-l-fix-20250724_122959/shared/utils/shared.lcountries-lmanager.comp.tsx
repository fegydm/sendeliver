// File: src/shared/utils/shared.lcountries-lmanager.comp.tsx
// Last change: Fixed timer issues and improved caching with hasFetched flags

import type { Country } from '@/types/transport-forms.types';
import type { Language } from '@/types/language.types';
import { DEFAULT_LANGUAGES } from '@/types/language.types';

class CountriesManager {
  private static instance: CountriesManager;
  private countries: Country[] = [];
  private languages: Language[] = [];
  private countrySubscribers = new Set<(countries: Country[]) => void>();
  private languageSubscribers = new Set<(languages: Language[]) => void>();
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
    if (this.hasFetchedCountries && this.countries.length > 0) {
      console.log('[CountriesManager] Using cached countries');
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
      console.log(`[CountriesManager] Loaded ${this.countries.length} countries`);
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

  async getLanguages(): Promise<language[]> {
    if (this.hasFetchedLanguages && this.languages.length > 0) {
      console.log('[CountriesManager] Using cached languages');
      return this.languages;
    }
    
    const timerLabel = '[CountriesManager] fetch-languages';
    try {
      console.time(timerLabel);
      // Changed endpoint to /api/geo/languages to match the route mapping
      const response = await fetch('/api/geo/languages');
      if (!response.ok) throw new Error('Failed to fetch languages');
      const data = await response.json();
      
      // Map API response to Language type - ensuring proper property mapping
      this.languages = data.map((lang: any) => ({
        // Map code_2 to lc for language codes
        lc: lang.code_2 || lang.cc || '',
        cc: lang.cc || lang.code_2 || '', // Keep cc for backward compatibility
        name_en: lang.name_en || 'Unknown',
        native_name: lang.native_name || lang.name_en || 'Unknown',
        is_rtl: !!lang.is_rtl,
        primary_country_code: lang.primary_country_code || '',
        created_at: lang.created_at || new Date().toISOString(),
        updated_at: lang.updated_at || new Date().toISOString()
      }));
      
      this.hasFetchedLanguages = true;
      console.log(`[CountriesManager] Loaded ${this.languages.length} languages`);
      console.timeEnd(timerLabel);
    } catch (error) {
      console.error('[CountriesManager] Languages fetch error:', error);
      // Use DEFAULT_LANGUAGES when fetch fails to ensure we have fallback values
      this.languages = DEFAULT_LANGUAGES;
      this.hasFetchedLanguages = true;
      try {
        console.timeEnd(timerLabel);
      } catch (e) {
        // Ignore timer error
      }
    }
    
    this.notifyLanguages();
    return this.languages;
  }

  getFlagUrl(code: string): string {
    if (!code) return '/flags/4x3/optimized/xx.svg'; // Fallback for missing codes
    return `/flags/4x3/optimized/${code.toLowerCase()}.svg`;
  }

  // Keep these methods even if unused to preserve the original API
  private preloadData() {
    Promise.all([this.getCountries(), this.getLanguages()])
      .then(() => {
        console.log('[CountriesManager] Preloaded data successfully');
        // Temporarily disable flag preloading
        // this.preloadFlags();
      })
      .catch(error => {
        console.error('[CountriesManager] Error preloading data:', error);
      });
  }

  private preloadFlags() {
    const countryFlags = this.countries.filter(c => c.cc).map(c => c.cc);
    const languageFlags = this.languages.filter(l => l.lc || l.cc).map(l => l.lc || l.cc);
    const allFlags = [...countryFlags, ...languageFlags].filter(Boolean);
    
    console.log(`[CountriesManager] Preloading ${allFlags.length} flags`);
    
    // Use a throttled approach to avoid too many simultaneous requests
    let index = 0;
    const preloadNextBatch = () => {
      const batch = allFlags.slice(index, index + 10);
      batch.forEach(code => {
        const img = new Image();
        img.src = this.getFlagUrl(code);
      });
      
      index += 10;
      if (index < allFlags.length) {
        setTimeout(preloadNextBatch, 100);
      }
    };
    
    preloadNextBatch();
  }

  subscribeCountries(callback: (countries: Country[]) => void): () => void {
    this.countrySubscribers.add(callback);
    if (this.countries.length > 0) callback(this.countries);
    return () => this.countrySubscribers.delete(callback);
  }

  subscribeLanguages(callback: (languages: Language[]) => void): () => void {
    this.languageSubscribers.add(callback);
    if (this.languages.length > 0) callback(this.languages);
    return () => this.languageSubscribers.delete(callback);
  }

  private notifyCountries() {
    this.countrySubscribers.forEach(cb => cb(this.countries));
  }

  private notifyLanguages() {
    this.languageSubscribers.forEach(cb => cb(this.languages));
  }
}

export default CountriesManager.getInstance();