// File: src/routes/geo.routes.ts
// Last change: Fixed TypeScript typing for handleGetLocation

import { Router, RequestHandler } from "express";
import { ParsedQs } from "qs";
import { pool } from "../configs/db.js";
import { 
  GET_COUNTRIES_QUERY, 
  SEARCH_LOCATION_QUERY, 
  SEARCH_LOCATION_BY_COUNTRY_QUERY, 
  SEARCH_PLACE_QUERY, 
  DEFAULT_SEARCH_QUERY 
} from "./geo.queries.js";

interface LocationQuery extends ParsedQs {
  postalCode?: string;
  place?: string;
  countryCode?: string;
  limit?: string;
  offset?: string;
}

const router = Router();

// Store reference to last request to cancel previous queries
let lastAbortController: AbortController | null = null;

// Fetch list of countries
const handleGetCountries: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(GET_COUNTRIES_QUERY);
    res.json(result.rows);
  } catch (error: unknown) {
    console.error("❌ Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

// Search locations by postal code or place name
const handleGetLocation: RequestHandler<{}, any, any, LocationQuery> = async (req, res): Promise<void> => {
  const { postalCode, place, countryCode, limit = "20", offset = "0" } = req.query;

  // Cancel previous request if a new one is made
  if (lastAbortController) {
    lastAbortController.abort();
  }
  lastAbortController = new AbortController();
  const { signal } = lastAbortController;

  try {
    let result;
    const limitValue = parseInt(limit, 10);
    const offsetValue = parseInt(offset, 10);

    // Validate limit and offset values
    if (isNaN(limitValue) || isNaN(offsetValue) || limitValue <= 0 || offsetValue < 0) {
      res.status(400).json({ error: "Invalid limit or offset values" });
      return;
    }

    // Search by postal code
    if (postalCode && typeof postalCode === "string") {
      if (countryCode && typeof countryCode === "string") {
        result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [postalCode, countryCode, limitValue, offsetValue]);
      } else {
        result = await pool.query(SEARCH_LOCATION_QUERY, [postalCode, limitValue, offsetValue]);
      }
    }
    // Search by place name
    else if (place && typeof place === "string" && place.length >= 3) {
      result = await pool.query(SEARCH_PLACE_QUERY, [place, limitValue, offsetValue]);
    }
    // Default search
    else {
      result = await pool.query(DEFAULT_SEARCH_QUERY, [limitValue, offsetValue]);
    }

    if (!signal.aborted) {
      res.json({ results: result.rows });
    }
  } catch (error: unknown) {
    if (signal.aborted) {
      console.warn("🔄 Request aborted (user typed too fast)");
    } else {
      console.error("❌ Error searching locations:", error);
      res.status(500).json({ error: "Failed to search locations" });
    }
  }
};

// Register routes
router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);

export default router;
