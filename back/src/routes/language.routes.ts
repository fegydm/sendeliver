// File: back/src/routes/language.routes.ts
// Using custom type definitions to avoid import issues

import express from "express";

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
    const languages: any[] = []; // Empty array with explicit type
    res.json(languages);
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch languages" });
  }
});

// Get language for a country code
languageRouter.get("/country-language/:countryCode", async (req: Req, res: Res) => {
  try {
    const { countryCode } = req.params;
    const language: string = "en"; // Placeholder with explicit type
    res.json({ language });
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch country language" });
  }
});

export default languageRouter;