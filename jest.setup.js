import '@testing-library/jest-dom'

// Mock window.ethereum for tests
global.window = global.window || {};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};