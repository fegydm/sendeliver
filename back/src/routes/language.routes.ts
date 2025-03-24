// File: back/src/routes/language.routes.ts

import express from "express";
import languageServices from "../services/language.services.js";

// my types
interface Params {
  countryCode?: string;
}

interface Req {
  params: Params;
  query: Record<string, string>;
}

interface Res {
  json: (data: any) => void;
  status: (code: number) => Res;
}

// Fallback languages to ensure we always return something
const fallbackLanguages = [
  { code: "en", name_en: "English", native_name: "English", is_rtl: false, flag_url: "/flags/4x3/optimized/gb.svg" },
  { code: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false, flag_url: "/flags/4x3/optimized/sk.svg" },
  { code: "cs", name_en: "Czech", native_name: "Čeština", is_rtl: false, flag_url: "/flags/4x3/optimized/cz.svg" },
  { code: "de", name_en: "German", native_name: "Deutsch", is_rtl: false, flag_url: "/flags/4x3/optimized/de.svg" }
];

const languageRouter = express.Router();

// Error handling middleware
const asyncHandler = (fn: Function) => (req: Req, res: Res) => {
  Promise.resolve(fn(req, res)).catch(error => {
    console.error('Router error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: error.message || "Unknown error occurred"
    });
  });
};

// Get all languages
languageRouter.get("/", asyncHandler(async (_req: Req, res: Res) => {
  try {
    console.log("Processing /api/languages request");
    
    // Get languages from database through the service
    const languages = await languageServices.getAllLanguages();
    
    // Log the result for debugging
    console.log(`Retrieved ${languages?.length || 0} languages from service`);
    
    // Return fallback if no languages found
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      console.warn("No languages retrieved, using fallback languages");
      return res.json(fallbackLanguages);
    }
    
    // Always ensure we have at least English
    const hasEnglish = languages.some(lang => lang.code === 'en');
    if (!hasEnglish) {
      console.log("Adding English to language list as it was missing");
      languages.push({ 
        code: "en", 
        name_en: "English", 
        native_name: "English", 
        is_rtl: false,
        flag_url: "/flags/4x3/optimized/gb.svg" 
      });
    }
    
    // Ensure all languages have flag_url
    const languagesWithFlags = languages.map(lang => {
      if (!lang.flag_url) {
        // Generate flag URL if missing
        return {
          ...lang,
          flag_url: `/flags/4x3/optimized/${lang.code === 'en' ? 'gb' : lang.code.toLowerCase()}.svg`
        };
      }
      return lang;
    });
    
    console.log("Successfully returning languages");
    res.json(languagesWithFlags);
  } catch (error) {
    console.error("Unexpected error in /api/languages endpoint:", error);
    // Always return fallback languages if any error occurs
    res.json(fallbackLanguages);
  }
}));

// Legacy endpoint for backward compatibility - redirect to root
languageRouter.get("/languages", (req: Req, res: Res) => {
  console.log("Redirecting from /api/languages/languages to /api/languages");
  // Forward the request to the main endpoint
  languageRouter.handle(req, res);
});

// Get language for a country code
languageRouter.get("/:countryCode", asyncHandler(async (req: Req, res: Res) => {
  try {
    const { countryCode } = req.params;
    console.log(`Processing /api/languages/${countryCode} request`);
    
    if (!countryCode || typeof countryCode !== 'string') {
      console.warn("Invalid country code received:", countryCode);
      return res.status(400).json({ 
        error: "Invalid country code", 
        language: "en",
        languageDetails: {
          code: "en",
          name_en: "English",
          native_name: "English",
          is_rtl: false,
          flag_url: "/flags/4x3/optimized/gb.svg"
        }
      });
    }
    
    // Get language code for the country
    const language = await languageServices.getCountryLanguage(countryCode);
    console.log(`Country ${countryCode} maps to language: ${language}`);
    
    // Get language details
    const languageDetails = await languageServices.getLanguageDetails(language);
    
    // Construct flag URL for the country
    const countryFlagUrl = `/flags/4x3/optimized/${countryCode.toLowerCase()}.svg`;
    
    // Return complete response
    res.json({ 
      language, 
      languageDetails,
      country: {
        code: countryCode,
        flag_url: countryFlagUrl
      }
    });
  } catch (error) {
    console.error("Error in /api/languages/:countryCode endpoint:", error);
    res.status(500).json({ 
      error: "Failed to fetch country language", 
      language: "en",
      languageDetails: {
        code: "en",
        name_en: "English",
        native_name: "English",
        is_rtl: false,
        flag_url: "/flags/4x3/optimized/gb.svg"
      }
    });
  }
}));

// Legacy endpoint - for backward compatibility
languageRouter.get("/country/:countryCode", (req: Req, res: Res) => {
  console.log(`Redirecting from /api/languages/country/${req.params.countryCode} to /api/languages/${req.params.countryCode}`);
  // Modify the request to use the main country code endpoint
  req.params.countryCode = req.params.countryCode;
  // Forward to the main endpoint
  languageRouter.handle(req, res);
});

export default languageRouter;