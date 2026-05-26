import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/jest.unit.setup.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/__tests__/auth\\.test\\.ts',
    'src/__tests__/products\\.test\\.ts',
    'src/__tests__/users\\.test\\.ts',
    'src/__tests__/stockMovements\\.test\\.ts',
    'src/__tests__/reports\\.test\\.ts',
  ],
};

export default config;
