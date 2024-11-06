// /front/config/eslint.config.cjs
module.exports = [
  {
    ignores: ['**/node_modules/**', 'dist/**', 'build/**']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'react': require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
      'import': require('eslint-plugin-import')
    },
    languageOptions: {
      parser: require('@babel/eslint-parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react']
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'warn'
    }
  }
];