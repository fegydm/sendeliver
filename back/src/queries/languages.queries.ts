// File: ./back/src/queries/languages.queries.ts
// Last change: Clean language queries

export const GET_LANGUAGES_QUERY = `
  SELECT 
    code_2,
    name_en,
    native_name,
    is_rtl,
    primary_country_code
  FROM 
    geo.languages
  ORDER BY 
    name_en ASC
`;

export const GET_LANGUAGE_ID_QUERY = `
  SELECT 
    id 
  FROM 
    geo.languages 
  WHERE 
    code_2 = $1
`;

export const GET_LANGUAGE_CODE_QUERY = `
  SELECT 
    code_2 
  FROM 
    geo.languages 
  WHERE 
    id = $1
`;

export const GET_COUNTRY_LANGUAGE_QUERY = `
  SELECT 
    code_2
  FROM 
    geo.languages
  WHERE 
    LOWER(primary_country_code) = $1
  LIMIT 1
`;