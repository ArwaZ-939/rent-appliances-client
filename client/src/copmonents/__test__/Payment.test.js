import { describe, expect, test, beforeAll } from '@jest/globals';


const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const getMaxDate = () => {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  return oneYearFromNow.toISOString().split('T')[0];
};


describe('Payment utility functions', () => {
  let mockToday;

  beforeAll(() => {
    mockToday = new Date('2025-11-03T10:00:00Z');
    jest.useFakeTimers().setSystemTime(mockToday);
  });

  test('getTodayDate should return current date in YYYY-MM-DD format', () => {
    const result = getTodayDate();
    expect(result).toBe('2025-11-03'); 
  });

  test('getMaxDate should return date exactly one year from today', () => {
    const result = getMaxDate();
    expect(result).toBe('2026-11-03');
  });
});
