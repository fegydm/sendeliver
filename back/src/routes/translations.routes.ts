import express from 'express';
import translationsServices from '../services/translations.services.js';

// Custom interface definitions
interface Params {
  languageCode?: string;
}

interface Req {
  params: Params;
}

interface Res {
  json: (data: any) => void;
  status: (code: number) => Res;
}

const translationsRouter = express.Router();

// Generic async handler with custom types
const asyncHandler = (
  fn: (req: Req, res: Res) => Promise<any>
) => {
  return async (req: Req, res: Res) => {
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
  asyncHandler(async (req: Req, res: Res) => {
    const { languageCode } = req.params;
    console.log(`Processing /api/translations/${languageCode} request`);

    if (!languageCode || typeof languageCode !== 'string') {
      console.warn('Invalid language code received:', languageCode);
      res.status(400).json({ error: 'Invalid language code' });
      return;
    }

    const translations = await translationsServices.getTranslations(languageCode);
    console.log(`Retrieved ${Object.keys(translations || {}).length} translations for ${languageCode}`);

    res.json(translations ?? {});
  })
);

export default translationsRouter;