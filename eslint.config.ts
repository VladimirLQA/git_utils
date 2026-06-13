import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js, '@stylistic': stylistic, '@stylistic/js': stylistic },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.browser },
        rules: {

            // stylistic
            '@stylistic/js/function-call-argument-newline': ['error', 'consistent'],
            '@stylistic/js/space-unary-ops': [
                'error',
                {
                    words: true,
                    nonwords: false,
                },
            ],
            '@stylistic/js/space-infix-ops': 'error',
            '@stylistic/js/space-in-parens': ['error', 'never'],
            '@stylistic/js/space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
            '@stylistic/js/space-before-blocks': ['error', 'always'],
            '@stylistic/js/operator-linebreak': ['error', 'before'],
            '@stylistic/js/no-whitespace-before-property': 'error',
            '@stylistic/js/new-parens': 'error',
            '@stylistic/js/keyword-spacing': [
                'error',
                {
                    before: true,
                    after: true,
                    overrides: {
                        function: {
                            after: false,
                        },
                    },
                },
            ],
            '@stylistic/js/key-spacing': ['error', { beforeColon: false, afterColon: true, mode: 'minimum' }],
            '@stylistic/js/multiline-ternary': ['error', 'always-multiline'],
            '@stylistic/js/newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
            '@stylistic/js/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
            '@stylistic/js/no-trailing-spaces': 'error',
            '@stylistic/js/object-curly-spacing': ['error', 'always', { objectsInObjects: true }],
            '@stylistic/js/rest-spread-spacing': ['error', 'never'],
            '@stylistic/js/semi-style': ['error', 'last'],
            '@stylistic/js/semi-spacing': ['error', { before: false, after: true }],
            '@stylistic/js/dot-location': ['error', 'property'],
            '@stylistic/js/comma-spacing': ['error', { before: false, after: true }],
            '@stylistic/js/comma-style': ['error', 'last'],
            '@stylistic/js/arrow-spacing': ['error', { before: true, after: true }],
            '@stylistic/js/arrow-parens': ['error', 'always'],
            '@stylistic/js/block-spacing': ['error', 'always'],
            '@stylistic/js/indent': ['error', 4],
            '@stylistic/js/brace-style': ['error', '1tbs', { allowSingleLine: true }],
            '@stylistic/js/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/js/eol-last': ['error'],
            '@stylistic/js/function-call-spacing': ['error', 'never'],
            '@stylistic/js/max-len': [
                'error',
                {
                    code: 110,
                    ignoreTrailingComments: true,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignorePattern: '^\\s*(export\\s+abstract\\s+class\\s+.*|import\\s.+\\sfrom\\s.+;)$',
                    ignoreRegExpLiterals: true,
                },
            ],
            '@stylistic/js/semi': ['error', 'always', { omitLastInOneLineClassBody: true }],
            '@stylistic/js/quotes': ['error', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
            '@stylistic/js/padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: 'import', next: '*' },
                { blankLine: 'any', prev: 'import', next: 'import' },
            ],
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxBOF: 1 }],
        },
    },
    ...tseslint.configs.recommendedTypeChecked,
    {
        files: ['**/*.{ts,mts,cts}'],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-floating-promises': 'error',
        },
    },
    { files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
    { files: ['**/*.md'], plugins: { markdown }, language: 'markdown/commonmark', extends: ['markdown/recommended'] },
]);
