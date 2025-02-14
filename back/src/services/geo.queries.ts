// File: src/routes/geo.queries.ts
// Last change: Updated comments to use shortened names (psc, city) while keeping DB column names

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

export const CHECK_LOCATION_EXISTS_QUERY = `
SELECT EXISTS (
  SELECT 1 
  FROM geo.postal_codes p
  WHERE ($3::varchar IS NULL OR p.country_code = $3)
    AND ($1::varchar IS NULL OR p.postal_code LIKE $1 || '%')
    AND ($2::varchar IS NULL OR p.place_name ILIKE '%' || $2 || '%')
  LIMIT 1
) as found;
`;

// Main search query - handles both psc and city filtering
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
      THEN p.postal_code >= $1 
        AND p.postal_code < ($1 || 'Z')
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
LIMIT $6;`;

// Specific country search - optimized query when country_code is exactly 2 characters
export const SEARCH_LOCATION_BY_COUNTRY_QUERY = `
SELECT 
  p.country_code, 
  p.postal_code, 
  p.place_name, 
  c.name_en AS country,
  CONCAT('/flags/4x3/optimized/', LOWER(p.country_code), '.svg') AS flag_url,
  similarity(lower(p.postal_code), lower($1)) AS sim_psc,
  similarity(lower(p.place_name), lower($2)) AS sim_city
FROM geo.postal_codes p
JOIN geo.countries c ON p.country_code = c.code_2
WHERE
  (($1::TEXT IS NULL OR $1 = '')
    OR (lower(p.postal_code) % lower($1)
        AND similarity(lower(p.postal_code), lower($1)) > 0.8))
  AND (($2::TEXT IS NULL OR $2 = '')
    OR (lower(p.place_name) % lower($2)
        AND similarity(lower(p.place_name), lower($2)) > 0.36))
  AND (COALESCE(NULLIF($3, ''), p.country_code) = p.country_code)
  AND ($4::TEXT IS NULL OR $5::TEXT IS NULL
       OR (p.postal_code, p.place_name) > ($4::TEXT, $5::TEXT))
ORDER BY p.postal_code, p.place_name
LIMIT $6;




`;