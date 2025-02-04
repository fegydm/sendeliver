// File: src/routes/geo.routes.ts
// Last change: Fixed parameter mismatch in SQL queries and improved error handling

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

// ✅ Get location data (Main API route)
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
    // 🔍 If checking existence only
    if (checkExists === 'true') {
      const exists = await checkLocationExists(postalCode, city, countryCode);
      res.json({ exists });
      return;
    }

    const limitValue = parseInt(limit, 10);
    const offsetValue = parseInt(offset, 10);

    // 🚨 Validate query params
    if (isNaN(limitValue) || isNaN(offsetValue) || limitValue <= 0 || offsetValue < 0) {
      res.status(400).json({ error: "Invalid limit or offset values" });
      return;
    }

    // 🔍 Check if location exists before searching
    const exists = await checkLocationExists(postalCode, city, countryCode);
    if (!exists) {
      res.json({ results: [] });
      return;
    }

    let result;

    // 🌍 Search by Postal Code
    if (postalCode && typeof postalCode === "string") {
      if (countryCode && typeof countryCode === "string") {
        console.log(`🔍 Searching by postalCode=${postalCode} and countryCode=${countryCode}`);
        result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [
          postalCode, 
          countryCode, 
          limitValue, 
          offsetValue
        ]);
      } else {
        console.log(`🔍 Searching by postalCode=${postalCode}`);
        result = await pool.query(SEARCH_LOCATION_QUERY, [
          postalCode, 
          countryCode || null, // Ensure correct number of parameters
          limitValue, 
          offsetValue
        ]);
      }
    } 
    
    // 🏙️ Search by City Name
    else if (city && typeof city === "string") {
      console.log(`🔍 Searching by city=${city}`);
      result = await pool.query(SEARCH_CITY_QUERY, [city, limitValue, offsetValue]);
    } 
    
    // 🚨 No valid query params
    else {
      res.json({ results: [] });
      return;
    }

    // ✅ Return results
    res.json({ results: result.rows });

  } catch (error: unknown) {
    console.error("❌ Error searching locations:", error);
    res.status(500).json({ error: "Failed to search locations" });
  }
};

router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);

export default router;
