// /front/configs/eslint.cjs

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks', 'jsx-a11y', 'import'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  ignorePatterns: ['**/node_modules/**', 'dist/**', 'build/**'],
  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      rules: {
        'spellcheck/spell-checker': [
          'warn',
          {
            skipWords: ['Parens', 'sendeliver', 'jozo', 'hauler', 'nezabudaj', 'xy'],
            skipIfMatch: [
              '^.*[A-Z]{2,}.*$',  // ignore
              '.*\\d.*'           // ignore 
            ],
            minLength: 3,
          },
        ],
      },
    },
  ],
};
