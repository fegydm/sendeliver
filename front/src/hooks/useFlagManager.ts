// File: src/hooks/useFlagManager.ts
// Last change: Added immediate loading for English flag and optimized initial rendering

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface FlagData {
  flagUrl: string;
  englishName?: string;
}

// Pre-initialize English flag data synchronously to avoid any delay
const ENGLISH_FLAG_DATA: FlagData = {
  flagUrl: '/flags/4x3/optimized/gb.svg',
  englishName: 'English'
};

// Helper function: Returns flag data immediately or from cache
function getFlagDataSync(countryCode: string): FlagData {
  if (!countryCode) {
    return { flagUrl: '/flags/4x3/optimized/placeholder.svg' };
  }
  
  // For GB/EN, return pre-initialized data immediately
  if (countryCode.toLowerCase() === 'gb') {
    return ENGLISH_FLAG_DATA;
  }
  
  const storageKey = `flag-${countryCode.toLowerCase()}`;
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn(`Failed to get cached flag data for ${countryCode}`, e);
  }

  // Return a new object with just the flag URL
  return { 
    flagUrl: `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg` 
  };
}

// Async version to store in cache
async function getFlagData(countryCode: string): Promise<FlagData> {
  const flagData = getFlagDataSync(countryCode);
  
  // Store in cache if not already there
  try {
    const storageKey = `flag-${countryCode.toLowerCase()}`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(flagData));
    }
  } catch (e) {
    console.warn('Failed to save flag data to localStorage', e);
  }
  
  return flagData;
}

// Hook options
interface FlagManagerOptions {
  prioritizedCountry: string;
  otherCountryCodes: string[];
  preloadPriority?: boolean;
  lazyLoadAll?: boolean;
}

// Hook return type
interface FlagManagerReturn {
  // Methods
  getFlagUrl: (countryCode: string) => string;
  preloadFlag: (countryCode: string) => void;
  preloadFlags: (countryCodes: string[]) => void;
  preloadAllFlags: (countryCodes: string[]) => void;
  reloadFlag: (countryCode: string) => Promise<FlagData>;
  // State variables
  loadedFlags: string[];
  loadingFlags: string[];
  failedFlags: string[];
  // Loaded data
  priorityFlag: FlagData | null;
  otherFlags: Record<string, FlagData>;
}

export function useFlagManager(options: FlagManagerOptions): FlagManagerReturn {
  const { prioritizedCountry, otherCountryCodes, preloadPriority = false, lazyLoadAll = true } = options;

  // Initialize with GB already loaded if it's the priority country
  const initialLoadedFlags = useMemo(() => {
    const set = new Set<string>();
    if (prioritizedCountry === 'GB') {
      set.add('GB');
    }
    return set;
  }, [prioritizedCountry]);

  // Initialize English flag data immediately if it's the priority
  const initialPriorityFlag = useMemo(() => {
    return prioritizedCountry === 'GB' ? ENGLISH_FLAG_DATA : null;
  }, [prioritizedCountry]);

  // States for tracking loaded flags
  const [loadedFlags, setLoadedFlags] = useState<Set<string>>(initialLoadedFlags);
  const [loadingFlags, setLoadingFlags] = useState<Set<string>>(new Set());
  const [failedFlags, setFailedFlags] = useState<Set<string>>(new Set());
  const [priorityFlag, setPriorityFlag] = useState<FlagData | null>(initialPriorityFlag);
  const [otherFlags, setOtherFlags] = useState<Record<string, FlagData>>({});

  // UseRef to store current state values without causing re-renders
  const loadedFlagsRef = useRef<Set<string>>(loadedFlags);
  const loadingFlagsRef = useRef<Set<string>>(loadingFlags);
  const failedFlagsRef = useRef<Set<string>>(failedFlags);
  const prioritizedCountryRef = useRef<string>(prioritizedCountry);

  // Update refs when states change
  useEffect(() => {
    loadedFlagsRef.current = loadedFlags;
  }, [loadedFlags]);

  useEffect(() => {
    loadingFlagsRef.current = loadingFlags;
  }, [loadingFlags]);

  useEffect(() => {
    failedFlagsRef.current = failedFlags;
  }, [failedFlags]);

  useEffect(() => {
    prioritizedCountryRef.current = prioritizedCountry;
  }, [prioritizedCountry]);

  // getFlagUrl: Returns URL for SVG flag - optimized for immediate response
  const getFlagUrl = useCallback((countryCode: string): string => {
    if (!countryCode) return '/flags/4x3/optimized/placeholder.svg';
    
    // Return direct URL for immediate access
    return `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;
  }, []);

  // preloadFlag: Loads data for a single flag
  const preloadFlag = useCallback((countryCode: string): void => {
    if (!countryCode) return;
    
    // Skip GB, as it's already loaded synchronously
    if (countryCode.toUpperCase() === 'GB' && loadedFlagsRef.current.has('GB')) {
      return;
    }
    
    // Use refs instead of state values to avoid dependency issues
    if (
      loadedFlagsRef.current.has(countryCode) || 
      loadingFlagsRef.current.has(countryCode) || 
      failedFlagsRef.current.has(countryCode)
    ) {
      return;
    }
    
    setLoadingFlags(prev => new Set(prev).add(countryCode));

    // Use the simpler getFlagData function that doesn't actually fetch
    getFlagData(countryCode)
      .then(flagData => {
        setLoadedFlags(prev => new Set(prev).add(countryCode));
        setLoadingFlags(prev => {
          const updated = new Set(prev);
          updated.delete(countryCode);
          return updated;
        });
        // If it's a priority flag, save it separately
        if (countryCode === prioritizedCountryRef.current) {
          setPriorityFlag(flagData);
        } else {
          setOtherFlags(prev => ({ ...prev, [countryCode]: flagData }));
        }
      })
      .catch(err => {
        console.error(`Error loading flag for ${countryCode}:`, err);
        setFailedFlags(prev => new Set(prev).add(countryCode));
        setLoadingFlags(prev => {
          const updated = new Set(prev);
          updated.delete(countryCode);
          return updated;
        });
      });
  // Keep the empty dependency array to avoid re-renders
  }, []);

  // preloadFlags: Loads multiple flags in batches
  const preloadFlags = useCallback((countryCodes: string[]): void => {
    if (!Array.isArray(countryCodes) || countryCodes.length === 0) return;
    
    // Filter out GB as it's already loaded synchronously
    const flagsToLoad = countryCodes.filter(code => code && code.toUpperCase() !== 'GB');
    if (flagsToLoad.length === 0) return;
    
    const batchSize = 5;
    let currentIndex = 0;
    const loadBatch = () => {
      const batch = flagsToLoad.slice(currentIndex, currentIndex + batchSize);
      currentIndex += batchSize;
      batch.forEach(code => {
        if (code) preloadFlag(code);
      });
      if (currentIndex < flagsToLoad.length) {
        setTimeout(loadBatch, 100);
      }
    };
    loadBatch();
  }, [preloadFlag]);

  // preloadAllFlags: Delayed loading of all flags
  const preloadAllFlags = useCallback((countryCodes: string[]): void => {
    if (!lazyLoadAll || !Array.isArray(countryCodes) || countryCodes.length === 0) return;
    setTimeout(() => {
      preloadFlags(countryCodes);
    }, 1000); // Reduced from 3000ms to 1000ms for faster loading
  }, [lazyLoadAll, preloadFlags]);

  // Load priority flag on initialization if it's not GB (which is already loaded synchronously)
  useEffect(() => {
    if (prioritizedCountry && prioritizedCountry !== 'GB') {
      preloadFlag(prioritizedCountry);
    }
  }, [prioritizedCountry, preloadFlag]);

  // If preloadPriority is set, load other flags immediately
  useEffect(() => {
    if (preloadPriority && Array.isArray(otherCountryCodes) && otherCountryCodes.length > 0) {
      // Filter out GB as it's already loaded synchronously
      const otherCodes = otherCountryCodes.filter(code => code && code.toUpperCase() !== 'GB');
      if (otherCodes.length > 0) {
        preloadFlags(otherCodes);
      }
    }
  }, [preloadPriority, otherCountryCodes, preloadFlags]);

  // reloadFlag: Manually refreshes a flag (deletes from LS and loads new data)
  const reloadFlag = useCallback((countryCode: string): Promise<FlagData> => {
    if (!countryCode) return Promise.resolve({ flagUrl: '/flags/4x3/optimized/placeholder.svg' });
    
    const storageKey = `flag-${countryCode.toLowerCase()}`;
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Failed to remove flag data from localStorage', e);
    }
    
    // Use ref instead of state to avoid dependency issues
    if (loadedFlagsRef.current.has(countryCode)) {
      setLoadedFlags(prev => {
        const updated = new Set(prev);
        updated.delete(countryCode);
        return updated;
      });
    }
    
    return getFlagData(countryCode);
  // Keep the empty dependency array to avoid re-renders
  }, []);

  return {
    getFlagUrl,
    preloadFlag,
    preloadFlags,
    preloadAllFlags,
    reloadFlag,
    loadedFlags: Array.from(loadedFlags),
    loadingFlags: Array.from(loadingFlags),
    failedFlags: Array.from(failedFlags),
    priorityFlag,
    otherFlags,
  };
}

export default useFlagManager;