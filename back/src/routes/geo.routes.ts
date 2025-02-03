// File: src/routes/geo.routes.ts
// Last change: Moved queries to external file and improved error handling

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

const handleGetCountries: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(GET_COUNTRIES_QUERY);
    console.log("Countries query result:", result.rows.length, "rows");  // Debug log
    res.json(result.rows);
  } catch (error: unknown) {
    // Detailed error logging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    
    console.error("❌ Error fetching countries:", {
      message: errorMessage,
      stack: errorStack,
      error
    });
    
    res.status(500).json({ 
      error: "Failed to fetch countries",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

const checkLocationExists = async (
  postalCode?: string,
  city?: string,
  countryCode?: string
): Promise<boolean> => {
  try {
    const result = await pool.query(CHECK_LOCATION_EXISTS_QUERY, [
      postalCode, 
      city, 
      countryCode
    ]);
    return result.rows[0].found;
  } catch (error) {
    console.error("❌ Error checking location existence:", error);
    return false;
  }
};

const handleGetLocation: RequestHandler<{}, any, any, LocationQuery> = async (req, res): Promise<void> => {
  const { 
    postalCode, 
    city, 
    countryCode, 
    limit = "20", 
    offset = "0",
    checkExists 
  } = req.query;

  try {
    if (checkExists === 'true') {
      const exists = await checkLocationExists(postalCode, city, countryCode);
      res.json({ exists });
      return;
    }

    const limitValue = parseInt(limit, 10);
    const offsetValue = parseInt(offset, 10);

    if (isNaN(limitValue) || isNaN(offsetValue) || limitValue <= 0 || offsetValue < 0) {
      res.status(400).json({ error: "Invalid limit or offset values" });
      return;
    }

    const exists = await checkLocationExists(postalCode, city, countryCode);
    if (!exists) {
      res.json({ results: [] });
      return;
    }

    let result;
    if (postalCode && typeof postalCode === "string") {
      if (countryCode && typeof countryCode === "string") {
        result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [
          postalCode, 
          countryCode, 
          limitValue, 
          offsetValue
        ]);
      } else {
        result = await pool.query(SEARCH_LOCATION_QUERY, [
          postalCode, 
          limitValue, 
          offsetValue
        ]);
      }
    } else if (city && typeof city === "string") {
      result = await pool.query(SEARCH_CITY_QUERY, [city, limitValue, offsetValue]);
    } else {
      res.json({ results: [] });
      return;
    }

    res.json({ results: result.rows });

  } catch (error: unknown) {
    console.error("❌ Error searching locations:", error);
    res.status(500).json({ error: "Failed to search locations" });
  }
};

router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);

export default router;