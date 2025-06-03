
// File: ./back/src/routes/geo.countries.routes.ts
// Last change: Added language ID mapping for lc
import { Router, Request, Response, NextFunction } from 'express';
import countriesService from '../services/geo.countries.services.js';

const router = Router();

// GET /api/geo/countries
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = req.query.q as string | undefined;
    const countries = await countriesService.getCountries();
    let result = countries;

    if (q) {
      const searchTerm = q.toLowerCase();
      result = countries.filter((c: any) =>
        c.name_en.toLowerCase().includes(searchTerm) ||
        (c.name_sk && c.name_sk.toLowerCase().includes(searchTerm))
      );
    }

    result.sort((a: any, b: any) => a.name_en.localeCompare(b.name_en));
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// GET /api/geo/countries/location
router.get('/location', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const psc = req.query.psc as string | undefined;
    const city = req.query.city as string | undefined;
    const cc = req.query.cc as string | undefined;
    const lastPsc = req.query.lastPsc as string | undefined;
    const lastCity = req.query.lastCity as string | undefined;
    const checkExists = req.query.checkExists as string | undefined;
    const limitParam = req.query.limit as string | undefined ?? '10';
    const limit = parseInt(limitParam, 10);

    if (checkExists === 'true') {
      const exists = await countriesService.checkLocationExists(psc, city, cc);
      res.json({ exists });
      return;
    }

    const searchParams = {
      psc: psc === 'empty' ? undefined : psc,
      city: city === 'empty' ? undefined : city,
      cc: cc === 'empty' ? undefined : cc,
      limit,
      pagination: {
        lastPsc: lastPsc === 'empty' ? undefined : lastPsc,
        lastCity: lastCity === 'empty' ? undefined : lastCity
      }
    };

    const results = await countriesService.searchLocations(searchParams);
    res.json({ results: results.results, hasMore: results.hasMore });
  } catch {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// GET /api/geo/countries/country_formats
router.get('/country_formats', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cc = req.query.cc as string | undefined;

    if (!cc) {
      res.status(400).json({ error: 'Missing or invalid country code' });
      return;
    }

    const format = await countriesService.getCountryPostalFormat(cc);
    if (!format) {
      res.status(404).json({ error: 'Postal format not found' });
      return;
    }

    res.json(format);
  } catch {
    res.status(500).json({ error: 'Failed to fetch postal format' });
  }
});

export default router;
