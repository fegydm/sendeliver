// File: ./back/src/queries/maps.queries.ts
// Last change: 2025-04-17
// Description: Queries for Sendeliver map system boundaries (countries and regions)

// Get GeoJSON for country and region boundaries based on zoom level
export const GET_BOUNDARIES_GEOJSON_QUERY = `
SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', jsonb_agg(
        jsonb_build_object(
            'type', 'Feature',
            'id', id,
            'properties', jsonb_build_object(
                'code_2', code_2,
                'name', name,
                'name_en', name_en,
                'colour', colour,
                'level', level
            ),
            'geometry', ST_AsGeoJSON(geom)::jsonb
        )
    )
) AS geojson
FROM (
    -- Countries for zoom 0–4
    SELECT id, code_2, name, name_en, colour, geom, 'country'::text AS level
    FROM maps.world_boundaries_2level
    WHERE geom IS NOT NULL
      AND ST_IsValid(geom)
      AND ($1::integer BETWEEN 0 AND 4)
    UNION ALL
    -- Regions for zoom 5+
    SELECT id, code_2, name, name_en, colour, geom, 'region'::text AS level
    FROM maps.europe_boundaries_6level
    WHERE geom IS NOT NULL
      AND ST_IsValid(geom)
      AND ($1::integer >= 5)
    UNION ALL
    -- Fallback: Return countries if no regions are available
    SELECT id, code_2, name, name_en, colour, geom, 'country'::text AS level
    FROM maps.world_boundaries_2level
    WHERE geom IS NOT NULL
      AND ST_IsValid(geom)
      AND ($1::integer >= 5)
      AND NOT EXISTS (
          SELECT 1 
          FROM maps.europe_boundaries_6level 
          WHERE geom IS NOT NULL 
            AND ST_IsValid(geom)
      )
) AS combined
LIMIT CASE 
    WHEN $2::integer IS NOT NULL THEN $2
    ELSE 200
END;
`;

// Update boundary color for a specific country or region
export const UPDATE_BOUNDARY_COLOR_QUERY = `
UPDATE maps.world_boundaries_2level
SET colour = $2::text
WHERE id = $1::integer
RETURNING id, code_2, name_en, colour
UNION ALL
UPDATE maps.europe_boundaries_6level
SET colour = $2::text
WHERE id = $1::integer
RETURNING id, code_2, name_en, colour;
`;

// Check if a boundary exists by code_2
export const CHECK_BOUNDARY_EXISTS_QUERY = `
SELECT EXISTS (
    SELECT 1
    FROM maps.world_boundaries_2level
    WHERE code_2 = $1::varchar
    UNION ALL
    SELECT 1
    FROM maps.europe_boundaries_6level
    WHERE code_2 = $1::varchar
) AS found;
`;

// Get boundary details by code_2
export const GET_BOUNDARY_BY_CODE_QUERY = `
SELECT 
    id,
    code_2,
    name,
    name_en,
    colour,
    'country'::text AS level
FROM maps.world_boundaries_2level
WHERE code_2 = $1::varchar
UNION ALL
SELECT 
    id,
    code_2,
    name,
    name_en,
    colour,
    'region'::text AS level
FROM maps.europe_boundaries_6level
WHERE code_2 = $1::varchar;
`;