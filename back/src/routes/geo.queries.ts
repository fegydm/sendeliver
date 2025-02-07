// File: src/routes/geo.queries.ts
// Last change: Removed OFFSET and implemented Keyset Pagination for faster postal code search

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
   WHERE ($3::text IS NULL OR p.country_code = $3)
     AND ($1::text IS NULL OR p.postal_code LIKE $1 || '%')
     AND ($2::text IS NULL OR p.place_name ILIKE '%' || $2 || '%')
   LIMIT 1
 ) as found;
`;

// Main search query with Keyset Pagination
export const SEARCH_LOCATION_QUERY = `
 SELECT DISTINCT
   p.country_code, 
   p.postal_code, 
   p.place_name, 
   c.name_en AS country,
   c.logistics_priority,
   CASE 
     WHEN p.postal_code = $1 THEN 0 
     WHEN p.postal_code LIKE $1 || '%' THEN 1
     ELSE 2 
   END as match_rank,
   CONCAT('/flags/4x3/optimized/', LOWER(p.country_code), '.svg') AS flag_url
 FROM geo.postal_codes p
 JOIN geo.countries c ON p.country_code = c.code_2
 WHERE ($2::text IS NULL OR p.country_code = $2)
   AND ($1::text IS NULL OR p.postal_code LIKE $1 || '%')
   AND ($3::text IS NULL OR (c.logistics_priority, p.postal_code, p.country_code) < ($3, $4, $5))
 ORDER BY 
   c.logistics_priority DESC NULLS LAST,
   match_rank,
   p.postal_code
 LIMIT $6;
`;

// Search with specific country code using Keyset Pagination
export const SEARCH_LOCATION_BY_COUNTRY_QUERY = `
 SELECT DISTINCT
   p.country_code, 
   p.postal_code, 
   p.place_name, 
   c.name_en AS country,
   c.logistics_priority,
   CONCAT('/flags/4x3/optimized/', LOWER(p.country_code), '.svg') AS flag_url
 FROM geo.postal_codes p
 JOIN geo.countries c ON p.country_code = c.code_2
 WHERE p.country_code = $2
   AND p.postal_code LIKE $1 || '%'
   AND ($3::text IS NULL OR (c.logistics_priority, p.postal_code) < ($3, $4))
 ORDER BY 
   c.logistics_priority DESC NULLS LAST,
   CASE WHEN p.postal_code = $1 THEN 0 
        WHEN p.postal_code LIKE $1 || '%' THEN 1
        ELSE 2 END,
   p.postal_code
 LIMIT $5;
`;

// City search query with Keyset Pagination
export const SEARCH_CITY_QUERY = `
 SELECT DISTINCT
   p.country_code, 
   p.postal_code, 
   p.place_name, 
   c.name_en AS country,
   c.logistics_priority,
   CONCAT('/flags/4x3/optimized/', LOWER(p.country_code), '.svg') AS flag_url
 FROM geo.postal_codes p
 JOIN geo.countries c ON p.country_code = c.code_2
 WHERE ($2::text IS NULL OR p.country_code = $2)
   AND p.place_name ILIKE '%' || $1 || '%'
   AND ($3::text IS NULL OR (c.logistics_priority, p.place_name) < ($3, $4))
 ORDER BY 
   c.logistics_priority DESC NULLS LAST,
   CASE WHEN p.place_name ILIKE $1 THEN 0
        WHEN p.place_name ILIKE $1 || '%' THEN 1
        ELSE 2 END,
   p.place_name
 LIMIT $5;
`;
