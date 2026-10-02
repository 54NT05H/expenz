import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

const frontendFiles = ['src/**/*.{js,jsx}'];

export default [
  // Folders ESLint should skip
  { ignores: ['dist', 'build', 'coverage'] },

  // Basic JavaScript rules for everything
  js.configs.recommended,

  // React rules for the frontend
  { files: frontendFiles, ...react.configs.flat.recommended },
  { files: frontendFiles, ...react.configs.flat['jsx-runtime'] },

  // Our frontend settings
  {
    files: frontendFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser, // window, document, localStorage...
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off', // we don't use PropTypes in this project
      // `import React` is no longer needed in modern React, so don't complain about it
      'no-unused-vars': ['warn', { varsIgnorePattern: '^React$' }],
    },
  },

  // Backend and config files run in Node, not the browser
  {
    files: ['backend/**/*.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node, // process, Buffer...
    },
    rules: { 'no-unused-vars': 'warn' },
  },

  // MUST be last: switches off style rules that Prettier handles
  prettier,
];