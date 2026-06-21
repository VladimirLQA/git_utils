import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: {
                module: 'commonjs',
                target: 'es2022',
                strict: true,
                isolatedModules: true,
                ignoreDeprecations: '6.0',
            },
        }],
    },
};

export default config;
