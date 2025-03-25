// File: ./back/src/routes/geo.routes.ts
import { Router } from "express";
import countriesService from "../services/countries.services.js";
import languagesService from "../services/languages.services.js";
import translationsService from "../services/translations.services.js";
import { DEFAULT_FETCH_SIZE, MAX_QUERY_SIZE } from "../constants/geo.constants.js";

interface LocationQuery {
  psc?: string;
  city?: string;
  cc?: string;
  limit?: string;
  lastPsc?: string;
  lastCity?: string;
  checkExists?: string;
}

const router = Router();

// Countries: Get all countries
const handleGetCountries = async (req: any, res: any): Promise<void> => {
  try {
    const { q } = req.query;
    const countries = await countriesService.getCountries();

    if (!countries) {
      res.status(500).json({ error: "Failed to fetch countries" });
      return;
    }

    let result = countries;

    if (q && typeof q === 'string') {
      const searchTerm = q.toLowerCase();
      result = countries.filter((country: any) =>
        country.name_en.toLowerCase().includes(searchTerm) ||
        (country.name_sk && country.name_sk.toLowerCase().includes(searchTerm))
      );
    }

    result.sort((a: any, b: any) => a.name_en.localeCompare(b.name_en));
    res.json(result);
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

// Countries: Search locations
const handleGetLocation = async (req: any, res: any): Promise<void> => {
  try {
    const {
      psc,
      city,
      cc,
      limit = DEFAULT_FETCH_SIZE.toString(),
      lastPsc,
      lastCity,
      checkExists
    } = req.query as LocationQuery;

    const checkExistsBoolean = checkExists === 'true';
    if (checkExists !== undefined && checkExists !== 'true' && checkExists !== 'false') {
      res.status(400).json({ error: "Invalid checkExists value" });
      return;
    }

    if (checkExistsBoolean) {
      const exists = await countriesService.checkLocationExists(
        psc === 'empty' ? undefined : psc,
        city === 'empty' ? undefined : city,
        cc === 'empty' ? undefined : cc
      );
      res.json({ exists });
      return;
    }

    const limitValue = parseInt(limit, 10);
    if (isNaN(limitValue) || limitValue <= 0 || limitValue > MAX_QUERY_SIZE) {
      res.status(400).json({ 
        error: `Invalid limit value (must be between 1 and ${MAX_QUERY_SIZE})`
      });
      return;
    }

    if (psc && typeof psc !== 'string') {
      res.status(400).json({ error: "Invalid postal code (psc) value" });
      return;
    }
    if (city && typeof city !== 'string') {
      res.status(400).json({ error: "Invalid city value" });
      return;
    }
    if (cc && typeof cc !== 'string') {
      res.status(400).json({ error: "Invalid country code (cc) value" });
      return;
    }

    const searchParams = {
      psc: psc === 'empty' ? undefined : psc,
      city: city === 'empty' ? undefined : city,
      cc: cc === 'empty' ? undefined : cc,
      limit: limitValue,
      pagination: {
        lastPsc: lastPsc === 'empty' ? undefined : lastPsc,
        lastCity: lastCity === 'empty' ? undefined : lastCity
      }
    };

    const searchResults = await countriesService.searchLocations(searchParams);
    const hasMore = (!searchParams.psc && !searchParams.city) 
      ? searchResults.results.length === limitValue
      : false;

    res.json({ 
      results: searchResults.results,
      hasMore
    });
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to search locations" });
  }
};

// Countries: Get postal format
const handleGetCountryPostalFormat = async (req: any, res: any): Promise<void> => {
  try {
    const { cc } = req.query;

    if (!cc || typeof cc !== 'string') {
      res.status(400).json({ error: "Invalid or missing country code" });
      return;
    }

    const postalFormat = await countriesService.getCountryPostalFormat(cc);

    if (!postalFormat) {
      res.status(404).json({ error: "Postal format not found for given country code" });
      return;
    }

    res.json(postalFormat);
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to retrieve postal format" });
  }
};

// Languages: Get all languages with mapping for "ls"
const handleGetLanguages = async (req: any, res: any): Promise<void> => {
  try {
    const languages = await languagesService.getAllLanguages();
    // Map "ls" as equivalent to "cc" (geo.languages.code_2)
    const mappedLanguages = languages.map((lang: any) => ({
      ...lang,
      ls: lang.code_2 || lang.cc
    }));
    res.json(mappedLanguages);
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch languages" });
  }
};

// Languages: Get country language
const handleGetCountryLanguage = async (req: any, res: any): Promise<void> => {
  try {
    const { cc } = req.query;

    if (!cc || typeof cc !== 'string') {
      res.status(400).json({ error: "Invalid or missing country code" });
      return;
    }

    const languageCode = await languagesService.getCountryLanguage(cc);
    res.json({ language: languageCode });
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch country language" });
  }
};

// Languages: Get language details
const handleGetLanguageDetails = async (req: any, res: any): Promise<void> => {
  try {
    const { cc } = req.params;

    if (!cc || typeof cc !== 'string') {
      res.status(400).json({ error: "Invalid or missing language code" });
      return;
    }

    const languageDetails = await languagesService.getLanguageDetails(cc);
    res.json(languageDetails);
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch language details" });
  }
};

// Translations: Get translations
const handleGetTranslations = async (req: any, res: any): Promise<void> => {
  try {
    const { languageCode } = req.params;

    if (!languageCode || typeof languageCode !== 'string') {
      res.status(400).json({ error: "Invalid or missing language code" });
      return;
    }

    const translations = await translationsService.getTranslations(languageCode);
    res.json(translations);
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch translations" });
  }
};

router.get("/countries", handleGetCountries);
router.get("/location", handleGetLocation);
router.get("/country_formats", handleGetCountryPostalFormat);
router.get("/languages", handleGetLanguages);
router.get("/languages/country", handleGetCountryLanguage);
router.get("/languages/:cc", handleGetLanguageDetails);
router.get("/translations/:languageCode", handleGetTranslations);

export default router;
