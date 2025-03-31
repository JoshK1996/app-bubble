// Set environment to test
process.env.NODE_ENV = 'test';

// Mock the .env file
process.env.PORT = '4001';
process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_EXPIRATION = '1h';

// Increase the timeout for tests (useful for database operations)
jest.setTimeout(30000);

// Clean up resources after all tests
afterAll(async () => {
  // This can be used to close database connections or other resources
  // that need to be closed after all tests are run
}); 