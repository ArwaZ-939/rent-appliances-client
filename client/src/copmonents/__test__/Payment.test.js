// payment.test.js
import { describe, expect, test, beforeAll } from '@jest/globals';

// --- Recreate or import the two utility functions ---
// (In real usage, you'd export them from Payment.jsx instead of redefining)
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const getMaxDate = () => {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  return oneYearFromNow.toISOString().split('T')[0];
};

// --- Tests ---

describe('Payment utility functions', () => {
  let mockToday;

  beforeAll(() => {
    // Freeze current date to make tests predictable
    mockToday = new Date('2025-11-03T10:00:00Z');
    jest.useFakeTimers().setSystemTime(mockToday);
  });

  test('getTodayDate should return current date in YYYY-MM-DD format', () => {
    const result = getTodayDate();
    expect(result).toBe('2025-11-03'); // expected based on frozen system date
  });

  test('getMaxDate should return date exactly one year from today', () => {
    const result = getMaxDate();
    // Expected date: one year later = 2026-11-03
    expect(result).toBe('2026-11-03');
  });
});
