// File: back/src/routes/language.routes.ts
// Last change: Created new router for language-related endpoints

import { Router } from "express";

const languageRouter = Router();

// Get all languages
languageRouter.get("/languages", async (_req, res) => {
  try {
    const languages = []; // Placeholder: Replace with DB query, e.g., pool.query("SELECT * FROM geo.languages")
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch languages" });
  }
});

// Get language for a country code
languageRouter.get("/country-language/:countryCode", async (req, res) => {
  try {
    const { countryCode } = req.params;
    const language = "en"; // Placeholder: Replace with DB query, e.g., pool.query("SELECT l.code FROM geo.languages l JOIN geo.country_language cl ON cl.language_id = l.id WHERE cl.country_code = UPPER($1)", [countryCode])
    res.json({ language });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch country language" });
  }
});

export default languageRouter;