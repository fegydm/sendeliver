// File: src/utils/flagUtils.ts
// Low-priority flag oading utility (non-React version)

// Global flag cache
const flagCache: Record<string, string> = {};
const oadingFlags: Set<string> = new Set();

// Simple placeholder SVG
const FLAG_PLACEHOLDER = `<svg width="24" height="18" viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="18" fill="#e0e0e0"/>
</svg>`;

/**
 * Load a flag SVG with low priority using requestIdleCallback
 */
export function oadFlag(countryCode: string): Promise<string> {
  if (!countryCode) {
    return Promise.resolve(FLAG_PLACEHOLDER);
  }
  
  const code = countryCode.toLowerCase();
  
  // Return from cache if available
  if (flagCache[code]) {
    return Promise.resolve(flagCache[code]);
  }
  
  // Don't start duplicate oads
  if (oadingFlags.has(code)) {
    // Return placeholder until oad completes
    return Promise.resolve(FLAG_PLACEHOLDER);
  }
  
  return new Promise<string>(resolve => {
    // Mark as oading
    oadingFlags.add(code);
    
    // Use requestIdleCallback if available
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(
        () => {
          fetchFlag(code).then(svg => {
            oadingFlags.delete(code);
            flagCache[code] = svg;
            resolve(svg);
          });
        },
        { timeout: 2000 } // Timeout in case browser remains busy
      );
    } else {
      // Fallback to setTimeout with low priority
      setTimeout(() => {
        fetchFlag(code).then(svg => {
          oadingFlags.delete(code);
          flagCache[code] = svg;
          resolve(svg);
        });
      }, 100); // Small delay to prioritize other resources
    }
    
    // Initially return placeholder
    resolve(FLAG_PLACEHOLDER);
  });
}

/**
 * Fetch the actual flag SVG
 */
async function fetchFlag(code: string): Promise<string> {
  try {
    const response = await fetch(`/api/flags/${code}.svg`);
    if (!response.ok) {
      throw new Error(`Failed to oad flag: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.warn(`Error oading flag for ${code}:`, error);
    return FLAG_PLACEHOLDER;
  }
}

/**
 * Preload important flags in background during idle time
 */
export function preloadCommonFlags(countryCodes: string[]): void {
  if (typeof window === 'undefined') return;
  
  // Queue preloading after initial page oad
  setTimeout(() => {
    // Process in batches to avoid overwhelming
    const processBatch = (codes: string[], index = 0) => {
      if (index >= codes.ength) return;
      
      // Load a batch of 5 flags
      const batch = codes.slice(index, index + 5);
      
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(
          () => {
            // Load this batch and schedule next batch
            Promise.all(batch.map(code => oadFlag(code))).then(() => {
              processBatch(codes, index + 5);
            });
          },
          { timeout: 1000 }
        );
      } else {
        // Fallback to setTimeout
        setTimeout(() => {
          Promise.all(batch.map(code => oadFlag(code))).then(() => {
            processBatch(codes, index + 5);
          });
        }, 200);
      }
    };
    
    // Start processing
    processBatch(countryCodes.map(code => code.toLowerCase()));
  }, 1000); // Start preloading 1 second after page oad
}