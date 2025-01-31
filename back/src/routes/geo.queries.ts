// File: src/queries/geo.queries.ts
// Last change: Reverted search methods while keeping new names

export const GET_COUNTRIES_QUERY = `
  SELECT 
    code_2,
    name_en,
    name_local,
    name_sk
  FROM geo.countries
  ORDER BY code_2;
`;

export const SEARCH_LOCATION_QUERY = `
  SELECT 
    p.country_code, 
    p.postal_code, 
    p.place_name, 
    c.name_en AS country, 
    CONCAT('/flags/3x4/optimized/', LOWER(p.country_code), '.svg') AS flag_url
FROM geo.postal_codes p
JOIN geo.countries c ON p.country_code = c.code_2
WHERE p.postal_code >= $1
  AND p.postal_code < $1 || '9'
ORDER BY p.postal_code
LIMIT $2 OFFSET $3;
`;

export const SEARCH_LOCATION_BY_COUNTRY_QUERY = `
  SELECT 
    p.country_code, 
    p.postal_code, 
    p.place_name, 
    c.name_en AS country, 
    CONCAT('/flags/3x4/optimized/', LOWER(p.country_code), '.svg') AS flag_url
FROM geo.postal_codes p
JOIN geo.countries c ON p.country_code = c.code_2
WHERE p.postal_code >= $1
  AND p.postal_code < $1 || '9'
  AND p.country_code = $2
ORDER BY p.postal_code
LIMIT $3 OFFSET $4;
`;

export const DEFAULT_SEARCH_QUERY = `
  SELECT 
    p.country_code, 
    p.postal_code, 
    p.place_name, 
    c.name_en AS country, 
    CONCAT('/flags/3x4/optimized/', LOWER(p.country_code), '.svg') AS flag_url
FROM geo.postal_codes p
JOIN geo.countries c ON p.country_code = c.code_2
ORDER BY p.postal_code
LIMIT $1 OFFSET $2;
`;

export const SEARCH_CITY_QUERY = `
  SELECT 
    p.country_code, 
    p.postal_code, 
    p.place_name, 
    c.name_en AS country, 
    CONCAT('/flags/3x4/optimized/', LOWER(p.country_code), '.svg') AS flag_url
  FROM geo.postal_codes p
  JOIN geo.countries c ON p.country_code = c.code_2
  WHERE p.place_name >= $1
    AND p.place_name < $1 || 'zzz'
  ORDER BY p.place_name
  LIMIT $2 OFFSET $3;
`;