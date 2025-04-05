// File: src/hooks/optimizedUseLanguage.ts

import { useContext, useRef, useMemo } from 'react';
import LanguageContext from '@/contexts/TranslationContext';

// Define the return type based on what the context actually provides
interface LanguageHookReturn {
  t: (key: string) => string;
  currentLanguageCode: string;
  secondaryLanguageCode: string | null;
  changeLanguage: (langCode: string) => void;
  setSecondaryLanguage: (langCode: string | null) => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Optimized language hook that prevents unnecessary re-renders
 * by memoizing translation function and context values
 */
export function useLanguage(): LanguageHookReturn {
  const context = useContext(LanguageContext);
  
  // Keep track if we've logged the cache usage
  const hasLoggedCache = useRef(false);
  
  // Log cache usage only once
  if (!hasLoggedCache.current && Object.keys(context.t('') || {}).length > 0) {
    console.log('[useLanguage] Using cached translations');
    hasLoggedCache.current = true;
  }
  
  // Memoize the entire context to prevent re-renders when context doesn't change
  return useMemo(() => ({
    ...context,
    // Wrap the translation function to maintain reference equality
    t: (key: string) => context.t(key),
  }), [
    context.currentLanguageCode,
    context.secondaryLanguageCode,
    context.isLoading,
    context.error,
    // We intentionally don't include context.t in the dependency array
    // to avoid re-renders when only the t function changes
  ]);
}

export default useLanguage;