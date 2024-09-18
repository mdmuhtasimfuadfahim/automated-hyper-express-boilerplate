import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import html from 'eslint-plugin-html';

const compat = new FlatCompat({
    baseDirectory: import.meta.url,
});

export default [
    {
        ignores: ['node_modules/**'],
    },
    {
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                process: 'readonly',
                URL: 'readonly',
                global: 'readonly',
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            'prettier/prettier': 'error',
            'no-console': 'warn',
            'no-unused-vars': ['warn', { varsIgnorePattern: '^_' }],
            'no-undef': 'error',
        },
    },
    {
        files: ['**/*.html'],
        plugins: {
            html,
        },
        languageOptions: {
            globals: {
                window: 'readonly',
                document: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'off',
        },
    },
    ...compat.extends('plugin:prettier/recommended'),
];