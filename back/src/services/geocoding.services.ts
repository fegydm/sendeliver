// File: src/services/geocoding.services.ts
// Last change: Enhanced error handling and added detailed logging

import { RateLimiter } from "../utils/rate-limiter.js";

interface Coordinates {
  lat: number;
  lng: number;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
}

export class GeocodingService {
  private static instance: GeocodingService;
  private rateLimiter: RateLimiter;

  private constructor() {
    // Rate limiter to ensure we respect Nominatim's rate limits (1 request per second)
    this.rateLimiter = new RateLimiter(1, 1000);
  }

  public static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  /**
   * Validates if the response matches the expected Nominatim format.
   */
  private isNominatimResponse(data: unknown): data is NominatimResponse[] {
    return (
      Array.isArray(data) &&
      data.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "lat" in item &&
          "lon" in item &&
          "display_name" in item &&
          "importance" in item
      )
    );
  }

  /**
   * Fetches GPS coordinates for a given location using Nominatim API.
   * @param location - The name of the location to geocode.
   * @returns Coordinates object with latitude and longitude.
   */
  public async getCoordinates(location: string): Promise<Coordinates> {
    try {
      console.log(`[GEO] Fetching coordinates for location: "${location}"`);
      await this.rateLimiter.acquire();

      const params = {
        q: location,
        format: "json",
        limit: "1",
        "accept-language": "sk",
      };

      const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(params)}`;
      console.log(`[GEO] Request URL: ${url}`);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "SenDeliver/1.0",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed with status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log("[GEO] Raw response:", rawData);

      if (!this.isNominatimResponse(rawData)) {
        throw new Error("Invalid response format from Nominatim");
      }

      if (rawData.length === 0) {
        throw new Error(`Location not found: "${location}"`);
      }

      const coordinates = {
        lat: parseFloat(rawData[0].lat),
        lng: parseFloat(rawData[0].lon),
      };

      console.log(`[GEO] Coordinates for "${location}":`, coordinates);
      return coordinates;
    } catch (error) {
      console.error(`[GEO] Failed to get coordinates for "${location}":`, error);
      throw error;
    }
  }
}
