// File: ./back/src/queries/translations.queries.ts
// Last change: Added language ID mapping for lc

export const GET_TRANSLATIONS_QUERY = `
  SELECT key, text
  FROM geo.translations
  WHERE language_id = $1
`;

export const CHECK_TRANSLATIONS_TABLE_QUERY = `
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'geo' 
    AND table_name = 'translations'
  ) as exists
`;

export const GET_LANGUAGE_ID_BY_LC_QUERY = `
  SELECT id
  FROM geo.languages
  WHERE language_code = $1
`;