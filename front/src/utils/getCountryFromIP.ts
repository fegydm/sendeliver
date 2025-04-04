// File: ./front/src/utils/getCountryFromIP.ts
// Only one request per service is sent every 10 seconds.
// If a service is rate-limited, it will not send a new request and fallback "en" is used.

const RATE_LIMIT = 10 * 1000; // 10 seconds

// Global variables to track last request timestamp per service
let lastRequestIpapi = 0;
let lastRequestIpinfo = 0;

let pendingRequest: Promise<{ code: string; source: 'ipapi' | 'ipinfo' }> | null = null;

// Generic fetch helper with timeout (max 900ms) and timing logs
async function fetchWithTimeout(
  resource: string,
  options: RequestInit = {},
  timeout = 2000
): Promise<Response> {
  const controller = new AbortController();
  const startTime = performance.now();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    const elapsed = performance.now() - startTime;
    console.log(`[Geo API] ⏱ Request to ${resource} took ${elapsed.toFixed(2)}ms`);
    clearTimeout(id);
    return response;
  } catch (error) {
    const elapsed = performance.now() - startTime;
    console.error(`[Geo API] ⏱ Request to ${resource} failed after ${elapsed.toFixed(2)}ms with error: ${error}`);
    clearTimeout(id);
    throw error;
  }
}

// Helper: Custom race function that waits for the first successful promise
function racePromises<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let rejectedCount = 0;
    const errors: any[] = [];
    promises.forEach((p) => {
      p.then(resolve).catch((err) => {
        errors.push(err);
        rejectedCount++;
        if (rejectedCount === promises.length) {
          reject(new Error(`All promises failed: ${errors.join('; ')}`));
        }
      });
    });
  });
}

// Get country code from ipapi.co if rate limit allows
async function getCountryFromIpapi(): Promise<{ code: string; source: 'ipapi' }> {
  const now = Date.now();
  if (now - lastRequestIpapi < RATE_LIMIT) {
    throw new Error('Rate limit active for ipapi.co');
  }
  lastRequestIpapi = now;

  const response = await fetchWithTimeout('https://ipapi.co/json/', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Non-200 response from ipapi.co: ${response.status}`);
  }
  const data = await response.json();
  const code = data.country?.toLowerCase();
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid or missing country code from ipapi.co');
  }
  console.log('[Geo API] ✅ ipapi.co resolved country:', code);
  return { code, source: 'ipapi' };
}

// Get country code from ipinfo.io if rate limit allows
async function getCountryFromIpinfo(): Promise<{ code: string; source: 'ipinfo' }> {
  const now = Date.now();
  if (now - lastRequestIpinfo < RATE_LIMIT) {
    throw new Error('Rate limit active for ipinfo.io');
  }
  lastRequestIpinfo = now;

  const response = await fetchWithTimeout('https://ipinfo.io/json', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Non-200 response from ipinfo.io: ${response.status}`);
  }
  const data = await response.json();
  const code = data.country?.toLowerCase();
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid or missing country code from ipinfo.io');
  }
  console.log('[Geo API] ✅ ipinfo.io resolved country:', code);
  return { code, source: 'ipinfo' };
}

// Returns the user's country code based on IP.
// Only one request per service is sent every 10 seconds.
// If both services are rate-limited or fail, returns fallback "en".
export async function getCountryFromIP(): Promise<string> {
  // Ak je už prebiehajúca požiadavka, počkáme na jej výsledok
  if (pendingRequest) {
    try {
      const result = await pendingRequest;
      return result.code;
    } catch (e) {
      // Ignore, budeme skúšať nové požiadavky
    }
  }

  const now = Date.now();
  const allowedPromises: Promise<{ code: string; source: 'ipapi' | 'ipinfo' }>[] = [];
  // Check if each service is allowed to be called
  if (now - lastRequestIpapi >= RATE_LIMIT) {
    allowedPromises.push(getCountryFromIpapi());
  }
  if (now - lastRequestIpinfo >= RATE_LIMIT) {
    allowedPromises.push(getCountryFromIpinfo());
  }

  if (allowedPromises.length === 0) {
    console.warn('[Geo API] ⚠️ Both services are rate-limited. Falling back to "en".');
    return 'en';
  }

  pendingRequest = racePromises(allowedPromises);
  try {
    const result = await pendingRequest;
    pendingRequest = null;
    return result.code;
  } catch (error) {
    console.error('[Geo API] ❌ All allowed services failed:', error);
    pendingRequest = null;
    return 'en';
  }
}
