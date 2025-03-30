// File: ./back/src/queries/translations.queries.ts
// Last change: Clean translations queries for new schema

export const GET_TRANSLATIONS_QUERY = `
  SELECT 
    key, 
    text
  FROM 
    geo.translations
  WHERE 
    language_code = $1
`;

export const CHECK_TRANSLATIONS_TABLE_QUERY = `
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'geo' 
    AND table_name = 'translations'
  ) as exists
`;