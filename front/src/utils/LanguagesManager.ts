/* File: src/utils/LanguagesManager.ts */
/* Singleton for managing languages data with lazy loading and optimized performance */

import countriesManager from './CountriesManager';
import type { Language } from '@/types/language.types';

// Default fallback languages
const DEFAULT_LANGUAGES: Language[] = [
  { code: "en", name_en: "English", native_name: "English", is_rtl: false, flag_url: "/flags/4x3/optimized/gb.svg" },
  { code: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false, flag_url: "/flags/4x3/optimized/sk.svg" }
];

export class LanguagesManager {
  private static instance: LanguagesManager;
  private languages: Language[] | null = null;
  private fetchPromise: Promise<Language[]> | null = null;
  private subscribers = new Set<(languages: Language[]) => void>();
  private fetchStartTime: number = 0;
  private isInitialized = false;
  private minimumLanguagesLoaded = false;

  private constructor() {
    console.log('🔧 LanguagesManager instance created (lazy mode)');
    
    // Set up a minimal set of languages for immediate access
    this.languages = [...DEFAULT_LANGUAGES];
    this.minimumLanguagesLoaded = true;
  }

  static getInstance(): LanguagesManager {
    if (!LanguagesManager.instance) {
      LanguagesManager.instance = new LanguagesManager();
    }
    return LanguagesManager.instance;
  }

  // Explicitly initialize the manager when needed
  initialize(): void {
    if (!this.isInitialized) {
      console.log('🔄 Initializing LanguagesManager');
      this.isInitialized = true;
      // No immediate loading - will load when getLanguages() is called
    }
  }

  private async fetchLanguages(): Promise<Language[]> {
    this.fetchStartTime = performance.now();
    console.log('🚀 Starting languages fetch from /api/languages');
    try {
      const response = await fetch('/api/languages');
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`📦 Data received: ${data.length} languages`);
      
      // Get flag URLs from countries manager - without waiting for full country loading
      const flagsMap = countriesManager.getFlagsMap();
      
      // Process languages data to add flag URLs
      const processedData = data.map((lang: Language) => {
        if (!lang.flag_url) {
          // Try to get flag from primary_country_code first, then fall back to language code
          const countryCode = lang.primary_country_code || lang.code;
          const lowerCode = countryCode.toLowerCase();
          
          // Use pre-loaded flags if available, otherwise generate URL
          lang.flag_url = flagsMap[lowerCode] || `/flags/4x3/optimized/${lowerCode}.svg`;
        }
        return lang;
      });
      
      const duration = Math.round(performance.now() - this.fetchStartTime);
      console.log(`✅ Languages fetched successfully: ${processedData.length} items in ${duration}ms`);
      return processedData;
    } catch (error) {
      const duration = Math.round(performance.now() - this.fetchStartTime);
      console.error(`❌ Languages fetch failed after ${duration}ms:`, error instanceof Error ? error.message : error);
      console.warn('⚠️ Using fallback languages due to fetch failure');
      // Return fallback languages
      return DEFAULT_LANGUAGES;
    }
  }

  subscribe(callback: (languages: Language[]) => void): () => void {
    console.log('📥 New subscription request to LanguagesManager');
    
    // If we have at least the minimum languages, provide them immediately
    if (this.minimumLanguagesLoaded && this.languages) {
      console.log(`✅ Returning available languages to subscriber: ${this.languages.length}`);
      callback(this.languages);
      
      // If we haven't fully loaded yet, start loading in background
      if (!this.isInitialized) {
        this.initialize();
        this.getLanguages().catch(err => console.error('Background languages fetch failed:', err));
      }
    }
    
    this.subscribers.add(callback);
    console.log(`➕ Subscriber added, total: ${this.subscribers.size}`);
    
    return () => {
      this.subscribers.delete(callback);
      console.log(`➖ Subscriber removed, total: ${this.subscribers.size}`);
    };
  }

  private notify() {
    if (this.languages) {
      console.log(`📢 Notifying ${this.subscribers.size} subscribers about languages`);
      this.subscribers.forEach(callback => callback(this.languages!));
    } else {
      console.warn('⚠️ No languages to notify subscribers about');
    }
  }

  async getLanguages(forceRefresh = false): Promise<Language[]> {
    // Return cached languages if available and not forced to refresh
    if (this.languages && !forceRefresh) {
      console.log(`✅ Using cached languages: ${this.languages.length}`);
      return this.languages;
    }
    
    // If already fetching, return the existing promise
    if (this.fetchPromise) {
      console.log('🔄 Using existing fetch promise for languages');
      return this.fetchPromise;
    }
    
    // Start a new fetch
    console.log('🚀 Starting new languages fetch');
    this.isInitialized = true;
    
    this.fetchPromise = this.fetchLanguages()
      .then(data => {
        this.languages = data;
        this.minimumLanguagesLoaded = true;
        console.log(`📥 Languages cached: ${data.length}`);
        this.notify();
        return data;
      })
      .finally(() => {
        console.log('🏁 Languages fetch promise completed');
        this.fetchPromise = null;
      });
      
    return this.fetchPromise;
  }
  
  // Get just the primary and fallback languages for initial rendering
  getMinimalLanguages(): Language[] {
    return [...DEFAULT_LANGUAGES];
  }
  
  // Check if we have the full language data loaded
  isFullyLoaded(): boolean {
    return this.languages !== null && this.languages.length > DEFAULT_LANGUAGES.length;
  }
}

export default LanguagesManager.getInstance();