/**
 * Setup file for Vitest
 * This file runs before each test file
 */
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with React Testing Library's matchers
expect.extend(matchers);

// Mock the global fetch
global.fetch = vi.fn();

// Reset all mocks between tests
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
}); 