// File: src/routes/geo.routes.ts
// Last change: Removed DEFAULT_SEARCH_QUERY to prevent unnecessary data fetching

import { Router, RequestHandler } from "express";
import { ParsedQs } from "qs";
import { pool } from "../configs/db.js";
import { 
  GET_COUNTRIES_QUERY, 
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
}

const router = Router();

const handleGetCountries: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(GET_COUNTRIES_QUERY);
    res.json(result.rows);
  } catch (error: unknown) {
    console.error("\u274C Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

const handleGetLocation: RequestHandler<{}, any, any, LocationQuery> = async (req, res): Promise<void> => {
  const { postalCode, city, countryCode, limit = "20", offset = "0" } = req.query;

  console.log("Received query:", { postalCode, city, countryCode, limit, offset });

  try {
    let result;
    const limitValue = parseInt(limit, 10);
    const offsetValue = parseInt(offset, 10);

    if (isNaN(limitValue) || isNaN(offsetValue) || limitValue <= 0 || offsetValue < 0) {
      res.status(400).json({ error: "Invalid limit or offset values" });
      return;
    }

    if (postalCode && typeof postalCode === "string") {
      if (countryCode && typeof countryCode === "string") {
        result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [postalCode, countryCode, limitValue, offsetValue]);
      } else {
        result = await pool.query(SEARCH_LOCATION_QUERY, [postalCode, limitValue, offsetValue]);
      }
    } else if (city && typeof city === "string") {
      result = await pool.query(SEARCH_CITY_QUERY, [city, limitValue, offsetValue]);
    } else {
      res.json({ results: [] }); // Prevent default query from fetching unwanted data
      return;
    }

    console.log("Query result:", result.rows);

    res.json({ results: result.rows });
  } catch (error: unknown) {
    console.error("\u274C Error searching locations:", error);
    res.status(500).json({ error: "Failed to search locations" });
  }
};

router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);

export default router;
