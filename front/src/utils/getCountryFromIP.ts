// File: ./front/src/utils/getCountryFromIP.ts
// This function determines the country code using two services (ipapi.co and ipinfo.io) concurrently.
// It first checks localStorage for a valid cache. If not found or expired, it sends requests.
// The result is cached with the following properties:
// - code: determined country code (e.g., "sk")
// - id: identifier (0 = fallback, 1 = one service result, 2 = both services result)
// - details: elapsed times (in ms, rounded) for each service (e.g., { ipapi: 407, ipinfo: 161 })
// - timestamp: when the cache was updated
// - ttl: cache validity period (7 days in ms)

const CACHE_KEY = "ip-country-cache";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

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
  console.log(`[Geo API] ✅ ipapi.co: ${code} in ${elapsed}ms`);
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
  console.log(`[Geo API] ✅ ipinfo.io: ${code} in ${elapsed}ms`);
  return { code, source: "ipinfo", elapsed };
}

// Retrieve cache from localStorage if valid
function getCache(): { code: string; id: number; details: any; timestamp: number; ttl: number } | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const cacheData = JSON.parse(cached);
      if (Date.now() - cacheData.timestamp < cacheData.ttl && cacheData.code) {
        console.log("[Geo API] ♻️ Using cached country:", cacheData);
        return cacheData;
      }
    }
  } catch (e) {
    console.error("[Geo API] ❌ Error reading cache:", e);
  }
  return null;
}

// Update cache in localStorage with the determined country, identifier, and details
function updateCache(code: string, id: number, details: { ipapi?: number; ipinfo?: number }) {
  const cacheData = {
    code,
    id, // 0 = fallback, 1 = one result, 2 = both services result
    details,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("[Geo API] ✅ Updated cache:", cacheData);
  } catch (e) {
    console.error("[Geo API] ❌ Failed to update cache:", e);
  }
}

// Main function: Determines the country code based on IP.
// It checks the cache first, then sends concurrent requests if needed.
export async function getCountryFromIP(): Promise<string> {
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

  if (successes.length === 1) {
    chosenCode = successes[0].code;
    identifier = 1;
    details[successes[0].source] = successes[0].elapsed;
  } else if (successes.length >= 2) {
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
