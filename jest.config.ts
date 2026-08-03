import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.jest.json',
        diagnostics: { warnOnly: true },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|webp|svg|ico)$': '<rootDir>/tests/mocks/fileMock.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'backend/src/**/*.ts',
    '!src/**/*.d.ts',
    '!backend/src/server.ts',
    '!backend/src/seed/**',
    '!**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov', 'json-summary'],
  testTimeout: 30000,
  maxWorkers: '50%',
  clearMocks: true,
  restoreMocks: true,
};

export default config;
