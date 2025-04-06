// File: ./back/src/queries/geo.translations.queries.js
// Last change: Updated GET_TRANSLATIONS_QUERY to join with translations_keys

export const GET_TRANSLATIONS_QUERY = `
  SELECT k.key_name AS key, t.text
  FROM geo.translations t
  JOIN geo.translations_keys k ON t.key_id = k.id
  WHERE t.language_id = $1
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
