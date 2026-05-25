import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/__tests__/auth\\.test\\.ts',
    'src/__tests__/products\\.test\\.ts',
  ],
};

export default config;
