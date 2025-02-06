// File: src/routes/geo.routes.ts
// Last change: Load more mechanism extracted and fixed parameter count for SQL queries

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
  offset?: string;
  checkExists?: string;
}

const router = Router();

// Extracted load more mechanism helper
const applyLoadMoreMechanism = (
  rows: any[],
  queryLimit: number
): { rows: any[]; hasMore: boolean } => {
  let hasMore = false;
  if (rows.length === queryLimit) {
    hasMore = true;
    // Remove the extra row used for detection
    rows.pop();
  }
  return { rows, hasMore };
};

// ✅ Get list of countries
const handleGetCountries: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(GET_COUNTRIES_QUERY);
    console.log("✅ Countries query result:", result.rows.length, "rows");
    res.json(result.rows);
  } catch (error: unknown) {
    console.error("❌ Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

// ✅ Check if a location exists
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
    console.error("❌ Error checking location existence:", error);
    return false;
  }
};

// ✅ Get location data (Main API route) with load more mechanism
const handleGetLocation: RequestHandler<{}, any, any, LocationQuery> = async (req, res): Promise<void> => {
  const { 
    postalCode, 
    city, 
    countryCode, 
    limit = "20", 
    offset = "0",
    checkExists 
  } = req.query;

  console.log("🔍 Received query parameters:", { postalCode, city, countryCode, limit, offset, checkExists });

  try {
    // If checking existence only
    if (checkExists === 'true') {
      const exists = await checkLocationExists(postalCode, city, countryCode);
      res.json({ exists });
      return;
    }

    const limitValue = parseInt(limit, 10);
    const offsetValue = parseInt(offset, 10);

    // Validate query parameters
    if (isNaN(limitValue) || isNaN(offsetValue) || limitValue <= 0 || offsetValue < 0) {
      console.error("❌ Invalid limit or offset values");
      res.status(400).json({ error: "Invalid limit or offset values" });
      return;
    }

    // For load more, use an extra row: queryLimit = limitValue + 1
    const queryLimit = limitValue + 1;

    // Check if location exists before searching
    const exists = await checkLocationExists(postalCode, city, countryCode);
    if (!exists) {
      res.json({ results: [], hasMore: false });
      return;
    }

    let result;
    // Search by Postal Code
    if (postalCode && typeof postalCode === "string") {
      // If countryCode je zadaný a nie je prázdny, použijeme príslušný dotaz
      if (countryCode && typeof countryCode === "string" && countryCode.trim() !== "") {
        console.log(`🔍 Searching by postalCode=${postalCode} and countryCode=${countryCode}`);
        // Pôvodné poradie parametrov: [countryCode, postalCode, limit, offset]
        result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [
          countryCode, 
          postalCode, 
          queryLimit, 
          offsetValue
        ]);
      } else {
        console.log(`🔍 Searching by postalCode=${postalCode} (without countryCode)`);
        // Pre tento dotaz odovzdáme štyri parametre: postalCode, null, queryLimit, offsetValue
        result = await pool.query(SEARCH_LOCATION_QUERY, [
          postalCode, 
          null, 
          queryLimit, 
          offsetValue
        ]);
      }
    } 
    // Search by City Name
    else if (city && typeof city === "string") {
      console.log(`🔍 Searching by city=${city}`);
      result = await pool.query(SEARCH_CITY_QUERY, [city, queryLimit, offsetValue, null]); 
      // Ak tvoj dotaz na mesto vyžaduje štyri parametre, prípadne uprav túto časť.
    } 
    // No valid query parameters provided
    else {
      res.json({ results: [], hasMore: false });
      return;
    }

    // Apply load more mechanism
    const { rows, hasMore } = applyLoadMoreMechanism(result.rows, queryLimit);

    console.log(`✅ SQL Query returned ${rows.length} rows (hasMore: ${hasMore}) with queryLimit=${queryLimit} and offset=${offsetValue}`);
    res.json({ results: rows, hasMore });

  } catch (error: unknown) {
    console.error("❌ Error searching locations:", error);
    res.status(500).json({ error: "Failed to search locations" });
  }
};

router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);

export default router;
