// File: .back/src/routes/geo.routes.ts
// Last change: Use only FE parameter names (cc, psc, city) and map them to DB field names.
// Comments are in English.

import { Router, RequestHandler } from "express";
import { ParsedQs } from "qs";
import { GeoService } from "../services/geo.services.js";
import { DEFAULT_FETCH_SIZE, MAX_QUERY_SIZE } from "../constants/geo.constants.js";

interface LocationQuery extends ParsedQs {
  psc?: string;
  city?: string;
  cc?: string;
  limit?: string;
  lastPsc?: string;
  lastCity?: string;
  checkExists?: string;
}

const router = Router();
const geoService = GeoService.getInstance();

// Handler to get countries list
const handleGetCountries: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { q } = req.query;
    const countries = await geoService.getCountries();

    if (!countries) {
      console.error("❌ No countries data received");
      res.status(500).json({ error: "Failed to fetch countries" });
      return;
    }

    let result = countries;

    // Filter countries if query exists
    if (q && typeof q === 'string') {
      const searchTerm = q.toLowerCase();
      result = countries.filter(country =>
        country.name_en.toLowerCase().includes(searchTerm) ||
        country.name_sk.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by English name
    result.sort((a, b) => a.name_en.localeCompare(b.name_en));

    console.log("✅ Countries fetched:", result.length);
    res.json(result);
  } catch (error: unknown) {
    console.error("❌ Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

// Handler for location search with various parameters and pagination
const handleGetLocation: RequestHandler<{}, any, any, LocationQuery> = async (req, res): Promise<void> => {
  // Use only FE parameter names: psc, city, cc
  const {
    psc,
    city,
    cc,
    limit = DEFAULT_FETCH_SIZE.toString(),
    lastPsc,
    lastCity,
    checkExists
  } = req.query;

  try {
    // Validate checkExists parameter
    const checkExistsBoolean = checkExists === 'true';
    if (checkExists !== undefined && checkExists !== 'true' && checkExists !== 'false') {
      res.status(400).json({ error: "Invalid checkExists value" });
      return;
    }

    // Handle existence check if requested
    if (checkExistsBoolean) {
      const exists = await geoService.checkLocationExists(psc, city, cc);
      res.json({ exists });
      return;
    }

    // Validate and parse limit parameter
    const limitValue = parseInt(limit, 10);
    if (isNaN(limitValue) || limitValue <= 0 || limitValue > MAX_QUERY_SIZE) {
      res.status(400).json({ 
        error: `Invalid limit value (must be between 1 and ${MAX_QUERY_SIZE})`
      });
      return;
    }

    // Validate input parameters (if provided, must be string)
    if (psc && typeof psc !== 'string') {
      res.status(400).json({ error: "Invalid postal code (psc) value" });
      return;
    }
    if (city && typeof city !== 'string') {
      res.status(400).json({ error: "Invalid city value" });
      return;
    }
    if (cc && typeof cc !== 'string') {
      res.status(400).json({ error: "Invalid country code (cc) value" });
      return;
    }

    // Create search parameters object using FE parameter names
    const searchParams = {
      psc,
      city,
      cc,
      limit: limitValue,
      pagination: {
        lastPsc: lastPsc ? lastPsc : undefined,
        lastCity: lastCity ? lastCity : undefined
      }
    };

    const searchResults = await geoService.searchLocations(searchParams);

    // "Load more" is enabled only for an empty search (if psc or city is provided, disable load more)
    const hasMore = !psc && !city 
      ? searchResults.results.length === limitValue
      : false;

    res.json({ 
      results: searchResults.results,
      hasMore
    });
  } catch (error: unknown) {
    console.error("❌ Search failed:", error);
    res.status(500).json({ error: "Failed to search locations" });
  }
};

router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);

export default router;
