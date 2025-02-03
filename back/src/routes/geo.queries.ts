// File: src/routes/geo.queries.ts
// Last change: Added existence check query and optimized search conditions

export const GET_COUNTRIES_QUERY = `
  SELECT 
    code_2,
    name_en,
    name_local,
    name_sk
  FROM geo.countries
  ORDER BY code_2;
`;

export const CHECK_LOCATION_EXISTS_QUERY = `
  SELECT EXISTS (
    SELECT 1 
    FROM geo.postal_codes p
    WHERE ($1::text IS NULL OR p.postal_code LIKE $1 || '%')
      AND ($2::text IS NULL OR p.place_name ILIKE $2 || '%')
      AND ($3::text IS NULL OR p.country_code = $3)
    LIMIT 1
  ) as found;
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
  WHERE p.postal_code LIKE $1 || '%'
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
  WHERE p.postal_code LIKE $1 || '%'
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
  WHERE p.place_name ILIKE $1 || '%'
  ORDER BY p.place_name
  LIMIT $2 OFFSET $3;
`;