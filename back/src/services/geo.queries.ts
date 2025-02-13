// File: src/routes/geo.queries.ts
// Last change: Updated queries to handle both postal_code and place_name filters

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

// Main search query - handles both postal_code and place_name filtering
export const SEARCH_LOCATION_QUERY = `
SELECT 
  p.country_code, 
  p.postal_code, 
  p.place_name, 
  c.name_en AS country,
  c.logistics_priority,
  CONCAT('/flags/4x3/optimized/', LOWER(p.country_code), '.svg') AS flag_url
FROM geo.postal_codes p
JOIN geo.countries c ON p.country_code = c.code_2
WHERE ($1::TEXT IS NULL OR p.postal_code LIKE ($1::TEXT || '%'))
 AND ($2::TEXT IS NULL OR p.place_name ILIKE ('%' || $2::TEXT || '%'))
 AND ($3::TEXT IS NULL OR p.country_code LIKE ($3::TEXT || '%'))
 AND ($4::TEXT IS NULL OR (p.postal_code, p.place_name) > ($4::TEXT, $5::TEXT))
ORDER BY 
 c.logistics_priority DESC NULLS LAST,
 p.postal_code,
 p.place_name
LIMIT $6;
`;

// Specific country search - used when country_code is exactly 2 characters
export const SEARCH_LOCATION_BY_COUNTRY_QUERY = `
SELECT 
  p.country_code, 
  p.postal_code, 
  p.place_name, 
  c.name_en AS country,
  CONCAT('/flags/4x3/optimized/', LOWER(p.country_code), '.svg') AS flag_url
FROM geo.postal_codes p
JOIN geo.countries c ON p.country_code = c.code_2
WHERE p.country_code = $1::TEXT
 AND (
   ($2::TEXT IS NULL OR p.postal_code LIKE ($2::TEXT || '%'))
   OR ($3::TEXT IS NULL OR p.place_name ILIKE ('%' || $3::TEXT || '%'))
 )
 AND ($4::TEXT IS NULL OR (p.postal_code, p.place_name) > ($4::TEXT, $5::TEXT))
ORDER BY p.postal_code, p.place_name
LIMIT $6;
`;