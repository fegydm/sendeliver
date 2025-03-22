// File: back/src/routes/language.routes.ts
// Last change: Fixed imports for esModuleInterop and TypeScript 5.7.3

import express from "express";
import type { Request, Response } from "express";

const languageRouter = express.Router();

// Get all languages
languageRouter.get("/languages", async (_req: Request, res: Response) => {
  try {
    const languages: unknown[] = [];
    res.json(languages);
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch languages" });
  }
});

// Get language for a country code
languageRouter.get("/country-language/:countryCode", async (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params;
    const language: string = "en";
    res.json({ language });
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch country language" });
  }
});

export default languageRouter;