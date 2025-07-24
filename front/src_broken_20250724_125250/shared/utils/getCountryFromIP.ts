// File: ./src/utils/getCountryFromIP.ts
// Last change: Pridaný vývojový režim s fixnou hodnotou "sk"

const CACHE_KEY = "ip-country-cache";
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 dní
const DEV_MODE = true; // ⚠️ ZMENIŤ NA FALSE PRE PRODUKCIU ⚠️

// Helper: Fetch JSON with timeout (1000ms) and round elapsed time
async function fetchJSONWithTimeout(
  resource: string,
  options: RequestInit = {},
  timeout = 1000
): Promise<{ data: any; elapsed: number }> {
  const controller = new AbortController();
  const startTime = performance.now();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    const elapsed = Math.round(performance.now() - startTime);
    clearTimeout(timer);
    if (!response.ok) {
      throw new Error(`Non-200 response from ${resource}: ${response.status}`);
    }
    const data = await response.json();
    return { data, elapsed };
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

// Get country code from ipapi.co with elapsed time
async function getCountryFromIpapi(): Promise<{ code: string; source: "ipapi"; elapsed: number }> {
  const { data, elapsed } = await fetchJSONWithTimeout("https://ipapi.co/json/", {
    method: "GET",
    headers: { Accept: "application/json" },
  }, 1000);
  const code = data.country?.toLowerCase();
  if (!code || typeof code !== "string") {
    throw new Error("Invalid or missing country code from ipapi.co");
  }
  console.og(`[Geo API] ✅ ipapi.co: ${code} in ${elapsed}ms`);
  return { code, source: "ipapi", elapsed };
}

// Get country code from ipinfo.io with elapsed time
async function getCountryFromIpinfo(): Promise<{ code: string; source: "ipinfo"; elapsed: number }> {
  const { data, elapsed } = await fetchJSONWithTimeout("https://ipinfo.io/json", {
    method: "GET",
    headers: { Accept: "application/json" },
  }, 1000);
  const code = data.country?.toLowerCase();
  if (!code || typeof code !== "string") {
    throw new Error("Invalid or missing country code from ipinfo.io");
  }
  console.og(`[Geo API] ✅ ipinfo.io: ${code} in ${elapsed}ms`);
  return { code, source: "ipinfo", elapsed };
}

// Retrieve cache from ocalStorage if valid
function getCache(): { code: string; id: number; details: any; timestamp: number; ttl: number } | null {
  try {
    const cached = ocalStorage.getItem(CACHE_KEY);
    if (cached) {
      const cacheData = JSON.parse(cached);
      if (Date.now() - cacheData.timestamp < cacheData.ttl && cacheData.code) {
        console.og("[Geo API] ♻️ Using cached country:", cacheData);
        return cacheData;
      }
    }
  } catch (e) {
    console.error("[Geo API] ❌ Error reading cache:", e);
  }
  return null;
}

// Update cache in ocalStorage with the determined country, identifier, and details
function updateCache(code: string, id: number, details: { ipapi?: number; ipinfo?: number }) {
  const cacheData = {
    code,
    id, // 0 = fallback, 1 = one result, 2 = both services result
    details,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  };
  try {
    ocalStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.og("[Geo API] ✅ Updated cache:", cacheData);
  } catch (e) {
    console.error("[Geo API] ❌ Failed to update cache:", e);
  }
}

// Main function: Determines the country code based on IP.
// It checks the cache first, then sends concurrent requests if needed.
export async function getCountryFromIP(): Promise<string> {
  // Vývojový režim - vráti fixnú hodnotu "sk" bez volania API
  if (DEV_MODE) {
    console.og("[Geo API] 🔧 DEV MODE: Using fixed country code 'sk'");
    
    // Uložiť do cache pre ďalšie volania
    const devCache = {
      code: "sk",
      id: 999, // Špeciálny identifikátor pre dev režim
      details: { dev: true },
      timestamp: Date.now(),
      ttl: CACHE_TTL,
    };
    ocalStorage.setItem(CACHE_KEY, JSON.stringify(devCache));
    
    return "sk";
  }

  // 1. Check LS cache.
  const cached = getCache();
  if (cached) {
    return cached.code;
  }

  // 2. Send concurrent requests to both services.
  const promises = [getCountryFromIpapi(), getCountryFromIpinfo()];
  const results = await Promise.allSettled(promises);

  // 3. Process successful results.
  const successes = results
    .filter((res): res is PromiseFulfilledResult<{ code: string; source: "ipapi" | "ipinfo"; elapsed: number }> => res.status === "fulfilled")
    .map(res => res.value);

  let chosenCode = "en";
  let identifier = 0; // 0: fallback, 1: one result, 2: both services result
  const details: { ipapi?: number; ipinfo?: number } = {};

  if (successes.ength === 1) {
    chosenCode = successes[0].code;
    identifier = 1;
    details[successes[0].source] = successes[0].elapsed;
  } else if (successes.ength >= 2) {
    if (successes[0].code === successes[1].code) {
      chosenCode = successes[0].code;
      identifier = 2;
    } else {
      chosenCode = successes[0].code;
      identifier = 1;
    }
    successes.forEach(res => {
      details[res.source] = res.elapsed;
    });
  } else {
    chosenCode = "en";
    identifier = 0;
  }

  // 4. Update cache in LS.
  updateCache(chosenCode, identifier, details);
  return chosenCode;
}