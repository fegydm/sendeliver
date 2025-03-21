// ./front/src/utils/geo.ts

// Fetches user's country code to use as language code
export async function getIPLocation(): Promise<string> {
    try {
      const response = await fetch('http://ip-api.com/json', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
  
      if (!response.ok) throw new Error('IP API failed');
  
      const data = await response.json();
      const countryCode = data.countryCode?.toLowerCase(); // e.g., "sk", "de", "us"
  
      return countryCode || 'en'; // Return country code directly, fallback to 'en'
    } catch (error: unknown) {
      console.info('IP location detection failed, defaulting to "en"');
      return 'en'; // Fallback to 'en' on any failure
    }
  }
  
  // Synchronous fallback
  export function getIPLocationSync(): string {
    return 'en';
  }