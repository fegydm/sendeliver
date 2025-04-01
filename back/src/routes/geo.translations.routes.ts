// File: ./back/src/routes/geo.translations.routes.ts
// Last change: Added language ID mapping for lc

import express, { Request, Response } from 'express';
import translationsService from '../services/geo.translations.services.js';

const router = express.Router();

router.get('/:languageCode', async (req: Request, res: Response): Promise<void> => {
  try {
    const { languageCode } = req.params;

    if (!languageCode || typeof languageCode !== 'string') {
      res.status(400).json({ error: 'Invalid or missing language code' });
      return;
    }

    const translations = await translationsService.getTranslations(languageCode);
    res.json(translations);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

export default router;
