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
  // Exclude integration tests from the default run
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\.integration\.test\.ts$',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/config/', // Often configuration is hard to unit test effectively
    '/src/utils/AppError.ts', // Error classes don't need coverage
    '/src/types/', 
    '/src/index.ts', // Entry point setup logic
    '/src/app.ts', // Main app setup if separated
    '/src/routes.ts', // tsoa generated routes
    '\.schema\.ts$', // Schemas/models are typically tested via integration
  ],
}; 