// File: src/routes/geo.routes.ts
// Last change: Replaced OFFSET with Keyset Pagination for faster search queries

import { Router, RequestHandler } from "express";
import { ParsedQs } from "qs";
import { pool } from "../configs/db.js";
import { 
  GET_COUNTRIES_QUERY,
  CHECK_LOCATION_EXISTS_QUERY,
  SEARCH_LOCATION_QUERY,
  SEARCH_LOCATION_BY_COUNTRY_QUERY,
  SEARCH_CITY_QUERY
} from "./geo.queries.js";

interface LocationQuery extends ParsedQs {
  postalCode?: string;
  city?: string;
  countryCode?: string;
  limit?: string;
  lastPriority?: string;
  lastPostalCode?: string;
  lastCountryCode?: string;
  checkExists?: string;
}

const router = Router();

// Get countries list with logistics priority
const handleGetCountries: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(GET_COUNTRIES_QUERY);
    console.log("✅ Countries fetched:", result.rows.length);
    res.json(result.rows);
  } catch (error: unknown) {
    console.error("❌ Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

// Check if a location exists in the database
const checkLocationExists = async (
  postalCode?: string,
  city?: string,
  countryCode?: string
): Promise<boolean> => {
  try {
    const result = await pool.query(CHECK_LOCATION_EXISTS_QUERY, [
      postalCode || null, 
      city || null, 
      countryCode || null
    ]);
    return result.rows[0].found;
  } catch (error) {
    console.error("❌ Location check failed:", error);
    return false;
  }
};

// Main location search endpoint
const handleGetLocation: RequestHandler<{}, any, any, LocationQuery> = async (req, res): Promise<void> => {
  const { 
    postalCode, 
    city, 
    countryCode, 
    limit = "20", 
    lastPriority,
    lastPostalCode,
    lastCountryCode,
    checkExists 
  } = req.query;

  try {
    if (checkExists === 'true') {
      const exists = await checkLocationExists(postalCode, city, countryCode);
      res.json({ exists });
      return;
    }

    const limitValue = parseInt(limit, 10);
    if (isNaN(limitValue) || limitValue <= 0) {
      console.error("❌ Invalid limit value");
      res.status(400).json({ error: "Invalid limit value" });
      return;
    }

    // Validate pagination parameters
    const paginationValues = lastPriority && lastPostalCode && lastCountryCode 
      ? [lastPriority, lastPostalCode, lastCountryCode] 
      : [null, null, null];

    let result;
    if (postalCode && typeof postalCode === "string") {
      if (countryCode?.trim()) {
        result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [
          postalCode, 
          countryCode, 
          ...paginationValues,
          limitValue
        ]);
      } else {
        result = await pool.query(SEARCH_LOCATION_QUERY, [
          postalCode, 
          null, 
          ...paginationValues,
          limitValue
        ]);
      }
    } else if (city?.trim()) {
      result = await pool.query(SEARCH_CITY_QUERY, [
        city, 
        countryCode?.trim() || null, 
        ...paginationValues,
        limitValue
      ]);
    } else {
      res.json({ results: [], hasMore: false });
      return;
    }

    const rows = result.rows;
    const hasMore = rows.length === limitValue;
    if (hasMore) rows.pop(); // Remove the extra row used for pagination check

    console.log(`✅ Found ${rows.length} results`);
    res.json({ results: rows, hasMore });

  } catch (error: unknown) {
    console.error("❌ Search failed:", error);
    res.status(500).json({ error: "Failed to search locations" });
  }
};

router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);

export default router;
