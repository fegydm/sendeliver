// File: ./back/src/routes/geo.translations.routes.ts
// Last change: Added /available endpoint for quick availability check

import express, { Request, Response } from 'express';
import translationsService from '../services/geo.translations.services.js';

const router = express.Router();

// Get translations for a language code
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lc } = req.query;

    if (!lc || typeof lc !== 'string') {
      res.status(400).json({ error: 'Invalid or missing lc parameter' });
      return;
    }

    const translations = await translationsService.getTranslations(lc);
    res.json(translations);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

// Check if translations are available for a language code (much faster)
router.get('/available', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lc } = req.query;
    
    if (!lc || typeof lc !== 'string') {
      res.status(400).json({ error: 'Invalid or missing lc parameter' });
      return;
    }
    
    const result = await translationsService.checkTranslationsAvailable(lc);
    
    // Set Cache-Control header for 1 hour
    res.set('Cache-Control', 'public, max-age=3600');
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to check translations availability' });
  }
});

export default router;