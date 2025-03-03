import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import react from 'eslint-plugin-react';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import vitest from '@vitest/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [{
  ignores: ['**/node_modules', '**/dist', '**/coverage', '**/.eslintcache'],
}, ...fixupConfigRules(compat.extends(
  'eslint:recommended',
  'plugin:@typescript-eslint/recommended',
  'plugin:react/recommended',
  'plugin:react-hooks/recommended',
  'plugin:react/jsx-runtime',
)), {
  plugins: {
    react: fixupPluginRules(react),
    vitest,
    'unused-imports': unusedImports,
  },

  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      ...vitest.environments.env.globals,
    },

    parser: tsParser,
  },

  settings: {
    react: {
      version: 'detect',
    },
  },

  rules: {
    '@typescript-eslint/no-unused-vars': 'error',

    // ...vitest.configs.recommended.rules, // TODO: enable after Feb 2025 dependency updates

    'vitest/expect-expect': 'warn',

    'unused-imports/no-unused-imports': 'warn',
    'array-bracket-spacing': ['error', 'never'],
    'block-spacing': ['error', 'never'],

    'brace-style': ['error', '1tbs', {
      allowSingleLine: true,
    }],

    'comma-spacing': ['error', {
      before: false,
      after: true,
    }],

    curly: ['error'],
    'dot-location': ['error', 'property'],
    'dot-notation': ['error'],
    'eol-last': ['error'],
    eqeqeq: ['error'],

    indent: ['error', 2, {
      SwitchCase: 0,
      VariableDeclarator: 1,
    }],

    'jsx-quotes': ['error', 'prefer-double'],
    'keyword-spacing': ['error'],
    'no-case-declarations': [0],

    'no-console': [1, {
      allow: ['warn', 'error'],
    }],

    'no-debugger': [1],
    'no-empty': ['error'],
    'no-extend-native': ['error'],
    'no-extra-semi': ['error'],
    'no-multi-spaces': ['error'],
    'no-restricted-syntax': ['error', 'WithStatement'],
    'no-sparse-arrays': ['error'],
    'no-trailing-spaces': ['error'],
    'no-unexpected-multiline': ['error'],
    'no-unneeded-ternary': ['error'],
    'no-unreachable': ['error'],
    'no-unsafe-finally': ['error'],
    'no-unused-vars': ['off'],
    quotes: ['error', 'single', 'avoid-escape'],
    semi: ['error', 'always'],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'use-isnan': ['error'],
    'valid-typeof': ['error'],
    'react/jsx-indent': ['error', 2],
    'react/jsx-no-duplicate-props': ['error'],
    'react/jsx-uses-react': ['error'],
    'react/jsx-uses-vars': ['error'],
    'react/no-access-state-in-setstate': ['error'],
    'react/no-children-prop': ['error'],
    'react/no-deprecated': [1],
    'react/no-danger-with-children': ['error'],
    'react/no-did-mount-set-state': ['error'],
    'react/no-did-update-set-state': ['error'],
    'react/no-direct-mutation-state': ['error'],
    'react/no-render-return-value': ['error'],
    'react/no-typos': ['error'],
    'react/no-unescaped-entities': ['error'],
    'react/no-unknown-property': ['error'],
    'react/no-unused-prop-types': [1],
    'react/no-unused-state': ['error'],
    'react/no-will-update-set-state': ['error'],
    'react/prop-types': ['error'],

    'react/require-default-props': [1, {
      functions: 'defaultArguments',
    }],

    'react/require-render-return': ['error'],

    'react/self-closing-comp': ['error', {
      component: true,
      html: false,
    }],

    'react/sort-comp': ['error'],
    'react/sort-prop-types': ['error'],
    'react/void-dom-elements-no-children': ['error'],
  },
}, ...compat.extends('plugin:testing-library/react').map(config => ({
  ...config,
  files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
}))];
