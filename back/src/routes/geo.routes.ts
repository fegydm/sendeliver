// File: src/routes/geo.routes.ts
// Last change: Added support for filtering postal codes by country

import { Router, RequestHandler } from "express";
import { pool } from "../configs/db.js";
import { 
  GET_COUNTRIES_QUERY, 
  SEARCH_LOCATION_QUERY, 
  SEARCH_LOCATION_BY_COUNTRY_QUERY, 
  SEARCH_PLACE_QUERY, 
  DEFAULT_SEARCH_QUERY 
} from "./geo.queries.js";

interface LocationQuery {
  postalCode?: string;
  place?: string;
  countryCode?: string;
}

const router = Router();

// Uchovávame referenciu na posledný request pre zrušenie starých dotazov
let lastAbortController: AbortController | null = null;

// Načítanie zoznamu krajín
const handleGetCountries: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(GET_COUNTRIES_QUERY);
    res.json(result.rows);
  } catch (error: unknown) {
    console.error("❌ Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

// Vyhľadávanie lokalít podľa PSČ alebo názvu miesta
const handleGetLocation: RequestHandler<{}, any, any, LocationQuery> = async (req, res) => {
  const { postalCode, place, countryCode } = req.query;

  // Ak sa spustí nový request, zrušíme predchádzajúci
  if (lastAbortController) {
    lastAbortController.abort();
  }
  lastAbortController = new AbortController();
  const { signal } = lastAbortController;

  try {
    let result;

    if (postalCode && typeof postalCode === "string") {
      if (countryCode && typeof countryCode === "string") {
        result = await pool.query(SEARCH_LOCATION_BY_COUNTRY_QUERY, [postalCode, countryCode]);
      } else {
        result = await pool.query(SEARCH_LOCATION_QUERY, [postalCode]);
      }
    } else if (place && typeof place === "string" && place.length >= 3) {
      result = await pool.query(SEARCH_PLACE_QUERY, [place]);
    } else {
      result = await pool.query(DEFAULT_SEARCH_QUERY);
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

router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);

export default router;
