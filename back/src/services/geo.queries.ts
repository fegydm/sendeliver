// File: src/routes/geo.queries.ts
// Updated queries: Normalize both postal_code column and parameter $1 using REPLACE

export const GET_COUNTRIES_QUERY = `
SELECT 
  code_2,
  name_en,
  name_local,
  name_sk,
  logistics_priority
FROM geo.countries
ORDER BY logistics_priority DESC NULLS LAST, code_2;
`;

export const GET_COUNTRY_POSTAL_FORMAT_QUERY = `
SELECT 
  country_code,
  postal_code_format,
  postal_code_regex
FROM geo.country_formats
WHERE country_code = $1;
`;

export const CHECK_LOCATION_EXISTS_QUERY = `
SELECT EXISTS (
  SELECT 1 
  FROM geo.postal_codes p
  WHERE ($3::varchar IS NULL OR p.country_code = $3)
    -- Compare normalized postal_code from DB and normalized parameter $1
    AND ($1::varchar IS NULL OR REPLACE(REPLACE(p.postal_code, ' ', ''), '-', '') LIKE REPLACE(REPLACE($1, ' ', ''), '-', '') || '%')
    AND ($2::varchar IS NULL OR p.place_name ILIKE '%' || $2 || '%')
  LIMIT 1
) as found;
`;

export const SEARCH_LOCATION_QUERY = `
WITH filtered_countries AS (
  SELECT code_2
  FROM geo.countries
  WHERE CASE 
    WHEN $3::TEXT IS NOT NULL 
      THEN code_2 LIKE $3 || '%'
    ELSE true 
  END
)
SELECT 
  p.country_code, 
  p.postal_code, 
  p.place_name, 
  c.name_en AS country,
  c.logistics_priority,
  CONCAT('/flags/4x3/optimized/', LOWER(p.country_code), '.svg') AS flag_url
FROM geo.postal_codes p 
JOIN geo.countries c ON c.code_2 = p.country_code
JOIN filtered_countries fc ON fc.code_2 = p.country_code
WHERE 
  CASE 
    WHEN $1::TEXT IS NOT NULL 
      THEN REPLACE(REPLACE(p.postal_code, ' ', ''), '-', '') >= REPLACE(REPLACE($1, ' ', ''), '-', '')
        AND REPLACE(REPLACE(p.postal_code, ' ', ''), '-', '') < (REPLACE(REPLACE($1, ' ', ''), '-', '') || 'Z')
    ELSE true 
  END
  AND CASE 
    WHEN $2::TEXT IS NOT NULL 
      THEN lower(p.place_name) LIKE '%' || lower($2) || '%'
    ELSE true 
  END
  AND CASE 
    WHEN $4::TEXT IS NOT NULL 
      AND $5::TEXT IS NOT NULL
      THEN (p.postal_code > $4 
           OR (p.postal_code = $4 AND p.place_name > $5))
    ELSE true 
  END
ORDER BY 
  c.logistics_priority DESC,
  p.postal_code,
  p.place_name
LIMIT $6;
`;

export const SEARCH_LOCATION_BY_COUNTRY_QUERY = `
WITH filtered_countries AS (
  SELECT code_2
  FROM geo.countries
  WHERE code_2 = $3
)
SELECT 
  p.country_code, 
  p.postal_code, 
  p.place_name, 
  c.name_en AS country,
  c.logistics_priority,
  CONCAT('/flags/4x3/optimized/', LOWER(p.country_code), '.svg') AS flag_url
FROM geo.postal_codes p 
JOIN geo.countries c ON c.code_2 = p.country_code
JOIN filtered_countries fc ON fc.code_2 = p.country_code
WHERE 
  CASE 
    WHEN $1::TEXT IS NOT NULL 
      THEN REPLACE(REPLACE(p.postal_code, ' ', ''), '-', '') >= REPLACE(REPLACE($1, ' ', ''), '-', '')
        AND REPLACE(REPLACE(p.postal_code, ' ', ''), '-', '') < (REPLACE(REPLACE($1, ' ', ''), '-', '') || 'Z')
    ELSE true 
  END
  AND CASE 
    WHEN $2::TEXT IS NOT NULL 
      THEN lower(p.place_name) LIKE '%' || lower($2) || '%'
    ELSE true 
  END
  AND CASE 
    WHEN $4::TEXT IS NOT NULL 
      AND $5::TEXT IS NOT NULL
      THEN (p.postal_code > $4 
           OR (p.postal_code = $4 AND p.place_name > $5))
    ELSE true 
  END
ORDER BY 
  c.logistics_priority DESC,
  p.postal_code,
  p.place_name
LIMIT $6;
`;
