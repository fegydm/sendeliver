// /back/config/eslint.config.cjs
module.exports = [
  {
    ignores: ['**/node_modules/**', 'dist/**', 'build/**']
  },
  {
    files: ['**/*.js'],
    plugins: {
      'import': require('eslint-plugin-import'),
      'jest': require('eslint-plugin-jest')
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'import/extensions': ['error', 'always', { js: 'always' }],
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
      'import/prefer-default-export': 'off',
      'max-len': ['error', { code: 100 }],
      'no-param-reassign': ['error', { props: false }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always']
    }
  }
];