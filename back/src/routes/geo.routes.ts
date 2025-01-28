// File: src/routes/geo.routes.ts
// Last change: Fixed return types in handlers

import { Router, RequestHandler } from "express";
import { GeocodingService } from "../services/geocoding.services.js";
import { pool } from "../configs/db.js";

interface GeoRequestBody {
  location: string;
}

interface PostalCodeQuery {
  country?: string;
  postalCode?: string;
  place?: string;
}

const router = Router();

const handleGeocoding: RequestHandler<{}, any, GeoRequestBody> = async (req, res) => {
  const { location } = req.body;

  if (!location) {
    res.status(400).json({ error: "Location is required." });
    return;
  }

  try {
    const coordinates = await GeocodingService.getInstance().getCoordinates(location);
    res.json(coordinates);
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    res.status(500).json({ error: "Failed to fetch coordinates." });
  }
};

const handleGetCountries: RequestHandler = async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        code_2,
        name_en,
        name_local,
        name_sk
      FROM geo.countries
      ORDER BY name_en
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries." });
  }
};

const handleGetPostalCodes: RequestHandler<{}, any, any, PostalCodeQuery> = async (req, res) => {
  const { country, postalCode } = req.query;

  // Require at least 4 characters for search
  if (postalCode && postalCode.length < 4) {
    res.json([]);
    return;
  }

  try {
    const query = `
      SELECT 
        country_code,
        postal_code,
        place_name
      FROM geo.postal_codes
      WHERE postal_code LIKE $1 || '%'
      ${country ? 'AND country_code = $2' : ''}
      LIMIT 10
    `;

    const params = country 
      ? [postalCode, country]
      : [postalCode];

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching postal codes:", error);
    res.status(500).json({ error: "Failed to fetch postal codes." });
  }
};

router.post("/geocode", handleGeocoding);
router.get("/countries", handleGetCountries);
router.get("/postal-codes", handleGetPostalCodes);

export default router;