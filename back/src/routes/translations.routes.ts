// File: src/routes/translations.routes.ts
import express from 'express';
import type { Request, Response, Router } from 'express';
import translationsServices from '../services/translations.services.js';

const translationsRouter: Router = express.Router();

// Generic async handler that supports any response type
const asyncHandler = <TRequest extends Request, TResponse extends Response>(
  fn: (req: TRequest, res: TResponse) => Promise<any>
) => {
  return async (req: TRequest, res: TResponse) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      console.error('Router error:', error);
      res.status(500).json({ 
        error: "Internal server error", 
        message: error.message || "Unknown error occurred"
      });
    }
  };
};

// GET /api/translations/:languageCode
translationsRouter.get(
  '/:languageCode',
  asyncHandler(async (req: Request, res: Response) => {
    const { languageCode } = req.params;
    console.log(`Processing /api/translations/${languageCode} request`);

    if (!languageCode || typeof languageCode !== 'string') {
      console.warn('Invalid language code received:', languageCode);
      res.status(400).json({ error: 'Invalid language code' });
      return;
    }

    const translations = await translationsServices.getTranslations(languageCode);
    console.log(`Retrieved ${Object.keys(translations).length} translations for ${languageCode}`);

    res.json(translations ?? {});
  })
);

export default translationsRouter;
