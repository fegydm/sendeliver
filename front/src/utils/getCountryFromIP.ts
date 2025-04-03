// File: ./front/src/utils/getCountryFromIP.ts
// Last change: Simplified to pure IP country lookup without fallback or localStorage logic

let cachedCountryCode: string | null = null;

// Generic fetch helper with timeout (default 500ms)
async function fetchWithTimeout(
  resource: string,
  options: RequestInit = {},
  timeout = 500
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, { ...options, signal: controller.signal });
  clearTimeout(id);
  return response;
}

// Returns the user's country code based on IP
export async function getCountryFromIP(): Promise<string> {
  const response = await fetchWithTimeout('https://ipapi.co/json/', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`[Geo API] ❌ Non-200 response: ${response.status}`);
  }

  const data = await response.json();
  const code = data.country?.toLowerCase();

  if (!code || typeof code !== 'string') {
    throw new Error('[Geo API] ❌ Invalid or missing country code');
  }

  cachedCountryCode = code;
  console.log('[Geo API] 🌍 IP-based country resolved:', code);
  return code;
}

// Returns last known country or undefined
export function getCountryFromIPSync(): string | undefined {
  return cachedCountryCode || undefined;
}
