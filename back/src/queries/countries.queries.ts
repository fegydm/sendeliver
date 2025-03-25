// File: ./back/src/queries/countries.queries.ts
// Last change: Added latitude and longitude to location search queries

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
WITH matched_locations AS (
  SELECT 
    p.country_code,
    p.postal_code,
    p.place_name,
    c.logistics_priority,
    p.latitude,
    p.longitude
  FROM geo.countries c
  JOIN geo.postal_codes p ON p.country_code = c.code_2
  WHERE 
    CASE 
      WHEN $3::TEXT IS NOT NULL 
        THEN c.code_2 LIKE $3 || '%'
      ELSE true 
    END
    AND CASE 
      WHEN $1::TEXT IS NOT NULL 
        THEN p.postal_code >= $1 AND p.postal_code < ($1::TEXT || 'Z')
      ELSE true 
    END
    AND CASE 
      WHEN $2::TEXT IS NOT NULL 
        THEN lower(p.place_name) LIKE '%' || lower($2) || '%'
      ELSE true 
    END
    AND CASE 
      WHEN $4::TEXT IS NOT NULL AND $5::TEXT IS NOT NULL
        THEN (p.postal_code > $4 OR (p.postal_code = $4 AND p.place_name > $5))
      ELSE true 
    END
  ORDER BY c.logistics_priority DESC, p.postal_code
  LIMIT CASE 
    WHEN $6::INTEGER IS NOT NULL THEN $6 * 5  
    ELSE 100
  END
)
SELECT 
  ml.country_code, 
  ml.postal_code, 
  ml.place_name, 
  c.name_en AS country,
  ml.logistics_priority,
  CONCAT('/flags/4x3/optimized/', LOWER(ml.country_code), '.svg') AS flag_url,
  ml.latitude,
  ml.longitude
FROM matched_locations ml
JOIN geo.countries c ON c.code_2 = ml.country_code
ORDER BY 
  ml.logistics_priority DESC,
  ml.postal_code,
  ml.place_name
LIMIT CASE 
  WHEN $6::INTEGER IS NOT NULL THEN $6
  ELSE 20
END;
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
  CONCAT('/flags/4x3/optimized/', LOWER(p.country_code), '.svg') AS flag_url,
  p.latitude,
  p.longitude
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
  p.postal_code,
  p.place_name
LIMIT $6;
`;

export const GET_RECENT_DELIVERIES_WITH_COORDINATES_QUERY = `
SELECT DISTINCT ON (d.id)
    d.id,
    d.delivery_id,
    d.delivery_date,
    d.delivery_time,
    d.delivery_type,
    d.delivery_country,
    d.delivery_zip,
    d.delivery_city,
    d.weight,
    d.id_pp,
    d.id_carrier,
    d.name_carrier,
    d.vehicle_type,
    p.latitude,
    p.longitude
FROM 
    deliveries d
INNER JOIN 
    geo.postal_codes p 
    ON d.delivery_country = p.country_code 
    AND d.delivery_zip = p.postal_code
WHERE 
    d.delivery_date >= CURRENT_DATE - 1
ORDER BY 
    d.id, d.delivery_date DESC, d.delivery_time DESC;
`;