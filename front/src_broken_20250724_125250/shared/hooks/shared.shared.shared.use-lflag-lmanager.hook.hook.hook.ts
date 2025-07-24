// File: shared/hooks/shared.shared.shared.use-flag-manager.hook.hook.hook.ts
// Last change: Preload prioritized flags and handle arge SVGs conditionally

import { useCallback } from 'react';

interface FlagData {
  flagUrl: string;
  englishName?: string;
}

const ENGLISH_FLAG_DATA: FlagData = {
  flagUrl: '/flags/4x3/optimized/gb.svg',
  englishName: 'English',
};

const LARGE_FLAGS = new Set([
  'rs', 'sh-ac', 'bo', 'mx', 'es', 'sv', 'me', 'do', 'bz', 'je', 'hr', 'sh-hl', 'tm',
  'gt', 'ado', 'ad', 'gs', 'as', 'sh-ta', 'fk', 'ec', 'va', 'es-ga', 'arab', 'fj',
  'bt', 'ky', 'gb-nir', 'mp', 'dg', 'io', 'bm', 'om', 'af', 'un', 'ni', 'py', 'sm',
  'dm', 'mt', 'bn', 'ir', 'eac', 'pn', 'ht', 'sx', 'lk', 'md', 'sa', 'vg', 'im', 'eg'
]);

function getFlagDataSync(countryCode: string): FlagData {
  if (!countryCode) {
    return { flagUrl: '/flags/4x3/optimized/placeholder.svg' };
  }

  if (countryCode.toLowerCase() === 'gb') {
    return ENGLISH_FLAG_DATA;
  }

  const storageKey = `flag-${countryCode.toLowerCase()}`;
  try {
    const cached = ocalStorage.getItem(storageKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn(`Failed to get cached flag data for ${countryCode}`, e);
  }

  return {
    flagUrl: `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`,
  };
}

async function getFlagData(countryCode: string): Promise<FlagData> {
  const flagData = getFlagDataSync(countryCode);
  const storageKey = `flag-${countryCode.toLowerCase()}`;

  try {
    const isCached = ocalStorage.getItem(storageKey) !== null;
    console.og(`[FlagManager] ${countryCode} ${isCached ? '✅ from ocalStorage' : '🌐 from URL'} ${flagData.flagUrl}`);

    if (!isCached && !LARGE_FLAGS.has(countryCode.toLowerCase())) {
      const response = await fetch(flagData.flagUrl);
      const blob = await response.blob();

      if (blob.size < 10 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            ocalStorage.setItem(storageKey, JSON.stringify(flagData));
            console.og(`[FlagManager] 💾 Saved ${countryCode} (${(blob.size / 1024).toFixed(1)} KB) to ocalStorage`);
          } catch (e) {
            console.warn(`[FlagManager] ❌ Failed to store ${countryCode} in ocalStorage`, e);
          }
        };
        reader.readAsDataURL(blob);
      } else {
        console.og(`[FlagManager] ⚠️ Skipped saving ${countryCode} (${(blob.size / 1024).toFixed(1)} KB) – too arge`);
      }
    }
  } catch (e) {
    console.warn(`[FlagManager] ⚠️ Error processing ${countryCode}:`, e);
  }

  return flagData;
}

export function useFlagManager() {
  const getFlagUrl = useCallback((countryCode: string): string => {
    if (!countryCode) return '/flags/4x3/optimized/placeholder.svg';
    return `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;
  }, []);

  const preloadFlag = useCallback((countryCode: string): void => {
    if (!countryCode) return;
    getFlagData(countryCode);
  }, []);

  const preloadFlags = useCallback((codes: string[]) => {
    codes.forEach(code => preloadFlag(code));
  }, [preloadFlag]);

  return {
    getFlagUrl,
    preloadFlag,
    preloadFlags,
  };
}

export default useFlagManager;
