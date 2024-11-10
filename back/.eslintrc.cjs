module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'import', 'jest'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/extensions': ['error', 'always', { js: 'always' }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'import/prefer-default-export': 'off',
    'max-len': ['error', { code: 100 }],
    'no-param-reassign': ['error', { props: false }],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
  ignorePatterns: ['dist/**'],
};
