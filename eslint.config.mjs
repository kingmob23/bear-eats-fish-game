import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

// Mimic CommonJS variables for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores: ['eslint.config.mjs'], // Exclude this file
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: path.resolve(__dirname, './tsconfig.json'),
      },
    },
  },
  ...compat.extends('eslint:recommended'),
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  eslintConfigPrettier,
  {
    ignores: ['.git', 'node_modules', 'dist', 'public'],
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn'],
      eqeqeq: 'error', // require === and !==
      curly: 'error', // require curly braces for all control statements
      'no-console': 'warn', // warn on console usage
      'no-debugger': 'error', // disallow debugger
      'no-var': 'error', // require let or const instead of var
      'prefer-const': 'error', // suggest using const
    },
  },
];
