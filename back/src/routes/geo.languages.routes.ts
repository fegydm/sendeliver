// File: ./back/src/routes/geo.languages.routes.ts  
// Last change: Type-safe query + param parsing for languages endpoints

import express, { Request, Response } from 'express';
import languagesService from '../services/geo.languages.services.js';

const router = express.Router();

// GET /api/geo/languages
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const languages = await languagesService.getAllLanguages();
    const mapped = languages.map((lang) => ({
      ...lang,
      ls: lang.cc || lang.lc // Optional alias
    }));
    res.json(mapped);
  } catch {
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

// GET /api/geo/languages/country?cc=SK
router.get('/country', async (req: Request, res: Response): Promise<void> => {
  try {
    const cc = req.query.cc as string | undefined;

    if (!cc || cc.length !== 2) {
      res.status(400).json({ error: 'Invalid or missing country code' });
      return;
    }

    const language = await languagesService.getCountryLanguage(cc);
    res.json({ language });
  } catch {
    res.status(500).json({ error: 'Failed to fetch country language' });
  }
});

// GET /api/geo/languages/:cc
router.get('/:cc', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cc } = req.params;

    if (!cc || typeof cc !== 'string' || cc.length > 3) {
      res.status(400).json({ error: 'Invalid or missing language code' });
      return;
    }

    const details = await languagesService.getLanguageDetails(cc);
    res.json(details);
  } catch {
    res.status(500).json({ error: 'Failed to fetch language details' });
  }
});

export default router;
