// File: back/src/routes/language.routes.ts

import express from "express";
import languageServices from "../services/language.services.js";

// my types
interface Params {
  countryCode?: string;
}

interface Req {
  params: Params;
}

interface Res {
  json: (data: any) => void;
  status: (code: number) => Res;
}

const languageRouter = express.Router();

// Get all languages
languageRouter.get("/languages", async (_req: Req, res: Res) => {
  try {
    // Get languages from database through the service
    const languages = await languageServices.getAllLanguages();
    
    // Return empty array if no languages found or error occurred
    if (!languages || !Array.isArray(languages)) {
      console.error("Failed to retrieve languages or invalid format");
      return res.json([
        { code: "en", name_en: "English", native_name: "English", is_rtl: false }
      ]);
    }
    
    // If no languages found in DB, return at least English as fallback
    if (languages.length === 0) {
      return res.json([
        { code: "en", name_en: "English", native_name: "English", is_rtl: false }
      ]);
    }
    
    res.json(languages);
  } catch (error: unknown) {
    console.error("Error in /languages endpoint:", error);
    // Fallback languages if database query fails
    res.json([
      { code: "en", name_en: "English", native_name: "English", is_rtl: false }
    ]);
  }
});

// Get language for a country code
languageRouter.get("/country-language/:countryCode", async (req: Req, res: Res) => {
  try {
    const { countryCode } = req.params;
    
    if (!countryCode || typeof countryCode !== 'string') {
      return res.status(400).json({ error: "Invalid country code" });
    }
    
    const language = await languageServices.getCountryLanguage(countryCode);
    res.json({ language });
  } catch (error: unknown) {
    console.error("Error in /country-language endpoint:", error);
    res.status(500).json({ error: "Failed to fetch country language", language: "en" });
  }
});

export default languageRouter;