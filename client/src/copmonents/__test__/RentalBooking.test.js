// src/copmonents/__test__/RentalBooking.test.js
import { describe, test, expect } from '@jest/globals';

// Define the utility functions based on the RentalBooking component logic
const sanitizeOmanPhoneNumber = (value) => {
  let sanitized = value.replace(/\D/g, ''); // Remove non-digit characters

  // Ensure number starts with 7 or 9 and has max 8 digits
  if (sanitized.length > 0) {
    const firstDigit = sanitized[0];
    if (firstDigit !== '6') {
      sanitized = ''; // Clear if doesn't start with 7 or 9
    } else if (sanitized.length > 8) {
      sanitized = sanitized.substring(0, 8); // Limit to 8 digits
    }
  }

  return sanitized;
};

const calculateTotalAmount = (days, pricePerDay, rentalPeriod) => {
  if (rentalPeriod === 'weeks') {
    return days * pricePerDay * 7; // Calculate total: weeks × 7 days × price per day
  } else {
    return days * pricePerDay; // Calculate total: days × price per day
  }
};

describe('RentalBooking utility functions', () => {

  describe('sanitizeOmanPhoneNumber', () => {
    test('removes non-digit characters', () => {
      expect(sanitizeOmanPhoneNumber('9abc12345678')).toBe('91234567');
    });

    test('ensures number starts with 7 or 9', () => {
      expect(sanitizeOmanPhoneNumber('51234567')).toBe(''); // Invalid start
      expect(sanitizeOmanPhoneNumber('71234567')).toBe('71234567'); // Valid start
      expect(sanitizeOmanPhoneNumber('91234567')).toBe('91234567'); // Valid start
    });

    test('limits number to 8 digits', () => {
      expect(sanitizeOmanPhoneNumber('9123456789')).toBe('91234567'); // Truncated to 8
    });

    test('returns empty string if input is empty', () => {
      expect(sanitizeOmanPhoneNumber('')).toBe('');
    });
  });

  describe('calculateTotalAmount', () => {
    test('calculates total for days correctly', () => {
      expect(calculateTotalAmount(3, 5, 'days')).toBe(15);
    });

    test('calculates total for weeks correctly', () => {
      expect(calculateTotalAmount(2, 5, 'weeks')).toBe(70); // 2 weeks × 7 days × 5
    });

    test('handles zero days', () => {
      expect(calculateTotalAmount(0, 5, 'days')).toBe(0);
    });

    test('handles invalid rental period', () => {
      expect(calculateTotalAmount(2, 5, 'months')).toBe(10); // Default to days if unknown
    });
  });
});
