// File: ./back/src/queries/geo.translations.queries.js
// Last change: Added COUNT_TRANSLATIONS_BY_LC_QUERY for quick availability checks

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
  )
`;

export const GET_LANGUAGE_ID_BY_LC_QUERY = `
  SELECT id
  FROM geo.languages
  WHERE code_2 = $1
`;

export const COUNT_TRANSLATIONS_BY_LC_QUERY = `
  SELECT COUNT(*) as count
  FROM geo.translations
  WHERE language_id = $1
`;