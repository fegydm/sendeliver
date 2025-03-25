// File: ./back/src/queries/translations.queries.ts
export const GET_TRANSLATIONS_QUERY = `
  SELECT 
    key, 
    text,
    namespace
  FROM 
    geo.translations
  WHERE 
    language_id = $1
`;

export const GET_LANGUAGE_ID_QUERY = `
  SELECT 
    id 
  FROM 
    geo.languages 
  WHERE 
    code_2 = $1
`;

export const CHECK_TRANSLATIONS_TABLE_QUERY = `
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'geo' 
    AND table_name = 'translations'
  )
`;