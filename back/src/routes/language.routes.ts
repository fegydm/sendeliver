import express from 'express';
import languageServices from '../services/language.services.js';

// Custom interface definitions
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

// GET /api/languages
languageRouter.get("/", async (_req: Req, res: Res) => {
  try {
    // Get languages from database through the service
    const languages = await languageServices.getAllLanguages();
    
    // Add debugging info
    console.log(`Sending ${languages.length} languages to client`);
    
    // Explicitly set status and send the array
    return res.status(200).json(languages);
  } catch (error: unknown) {
    console.error("Error in /languages endpoint:", error);
    // Fallback languages if database query fails
    return res.status(500).json([
      { code: "en", name_en: "English", native_name: "English", is_rtl: false, flag_url: "/flags/4x3/optimized/gb.svg" },
      { code: "sk", name_en: "Slovak", native_name: "Slovenčina", is_rtl: false, flag_url: "/flags/4x3/optimized/sk.svg" }
    ]);
  }
});

// GET /api/languages/:countryCode
languageRouter.get("/:countryCode", async (req: Req, res: Res) => {
  try {
    const { countryCode } = req.params;
    console.log(`Processing /api/languages/${countryCode} request`);
    
    if (!countryCode || typeof countryCode !== 'string') {
      return res.status(400).json({ error: "Invalid country code", language: "en" });
    }
    
    const language = await languageServices.getCountryLanguage(countryCode);
    console.log(`Country ${countryCode} maps to language: ${language}`);
    return res.status(200).json({ language });
  } catch (error: unknown) {
    console.error("Error in /languages/:countryCode endpoint:", error);
    return res.status(500).json({ error: "Failed to fetch country language", language: "en" });
  }
});

export default languageRouter;