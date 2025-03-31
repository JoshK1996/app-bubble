/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@src/(.*)$/': '<rootDir>/src/$1',
    '^@config/(.*)$/': '<rootDir>/src/config/$1',
    '^@features/(.*)$/': '<rootDir>/src/features/$1',
    '^@middleware/(.*)$/': '<rootDir>/src/middleware/$1',
    '^@utils/(.*)$/': '<rootDir>/src/utils/$1',
    '^@types/(.*)$/': '<rootDir>/src/types/$1',
  },
  // Only include integration tests
  testMatch: [
    '**/__tests__/**/*.(integration.)?test.[jt]s?(x)',
    '**/?(*.)+(integration.)?test.[jt]s?(x)'
  ],
  // Integration tests often need to run sequentially
  // maxWorkers: 1, // Or use --runInBand CLI flag (added in package.json script)
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupIntegration.ts'], // Setup script for integration tests
  testTimeout: 15000, // Increase timeout for potentially slower integration tests
}; 