/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: [
      '@testing-library/jest-native/extend-expect',
      '<rootDir>/__tests__/setup.js'
    ],
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/__tests__/setup.js'
    ],
    collectCoverageFrom: [
      'store/**/*.{ts,tsx}',
      'services/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'app/**/*.{ts,tsx}',
      '!**/*.d.ts',
      '!**/node_modules/**',
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
  };